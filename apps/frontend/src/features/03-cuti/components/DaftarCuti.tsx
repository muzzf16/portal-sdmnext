import React from 'react';
import { useCuti } from '../hooks/useCuti';
import { perbaruiStatusPermintaanCuti } from '../api/cutiApi';

const DaftarCuti: React.FC = () => {
  const { cuti, loading, error, setCuti } = useCuti();

  const handleUpdateStatus = async (id: string, status: string) => {
    const rejectionReasonPrompt = status.includes('Ditolak') ? prompt('Masukkan alasan penolakan:') : undefined;
    if (status.includes('Ditolak') && rejectionReasonPrompt === null) return; // User cancelled the prompt
    const rejectionReason = rejectionReasonPrompt || undefined;

    if (window.confirm(`Apakah Anda yakin ingin ${status.toLowerCase()} permintaan cuti ini?`)) {
      try {
        await perbaruiStatusPermintaanCuti(id, status, rejectionReason);
        setCuti(cuti.map(l => l.id === id ? { ...l, status } : l));
      } catch (error) {
        // Handle error
      }
    }
  };

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama Pegawai</th>
            <th className="py-2 px-4 border-b">Jenis Cuti</th>
            <th className="py-2 px-4 border-b">Tanggal Mulai</th>
            <th className="py-2 px-4 border-b">Tanggal Selesai</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Aksi</th>
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
                    <button onClick={() => handleUpdateStatus(l.id, 'Disetujui')} className="text-green-500 hover:underline">Setujui</button>
                    <button onClick={() => handleUpdateStatus(l.id, 'Ditolak')} className="ml-4 text-red-500 hover:underline">Tolak</button>
                    <button onClick={() => handleUpdateStatus(l.id, 'Disetujui Sistem')} className="ml-4 text-blue-500 hover:underline">Disetujui Sistem</button>
                    <button onClick={() => handleUpdateStatus(l.id, 'Ditolak Sistem')} className="ml-4 text-orange-500 hover:underline">Ditolak Sistem</button>
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
