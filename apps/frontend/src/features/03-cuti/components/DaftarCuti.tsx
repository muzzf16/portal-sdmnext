import React from 'react';
import { useCuti } from '../hooks/useCuti';
import { perbaruiStatusPermintaanCuti } from '../api/cutiApi';

const DaftarCuti: React.FC = () => {
  const { cuti, loading, error, setCuti } = useCuti();

  const handleUpdateStatus = async (id: string, status: string) => {
    let reason: string | undefined;
    if (status === 'Ditolak') {
        reason = prompt('Enter rejection reason:');
        if (reason === null) return; // User cancelled the prompt
    }

    const confirmAction = status === 'Disetujui' ? 'approve' : 'reject';

    if (window.confirm(`Are you sure you want to ${confirmAction} this leave request?`)) {
      try {
        await perbaruiStatusPermintaanCuti(id, status, reason);
        // Optimistically update the UI
        setCuti(cuti.map(l => l.id === id ? { ...l, status } : l));
      } catch (error) {
        console.error("Failed to update leave status", error);
        alert(`Failed to ${confirmAction} leave request.`);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Employee Name</th>
            <th className="py-2 px-4 border-b">Leave Type</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">End Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {cuti.map(l => (
            <tr key={l.id}>
              <td className="py-2 px-4 border-b">{l.employeeName}</td>
              <td className="py-2 px-4 border-b">{l.leaveType}</td>
              <td className="py-2 px-4 border-b">{l.startDate}</td>
              <td className="py-2 px-4 border-b">{l.endDate}</td>
              <td className="py-2 px-4 border-b">{l.status}</td>
              <td className="py-2 px-4 border-b">
                {l.status === 'Menunggu' && (
                  <>
                    <button onClick={() => handleUpdateStatus(l.id, 'Disetujui')} className="text-green-500 hover:underline">Approve</button>
                    <button onClick={() => handleUpdateStatus(l.id, 'Ditolak')} className="ml-4 text-red-500 hover:underline">Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarCuti;
