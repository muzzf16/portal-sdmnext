import React, { useState, useEffect } from 'react';
import { getDataChangeRequests, handleDataChangeRequest } from '@/shared/services/data-change.service';
import { DataChangeRequest } from '@/shared/types/types';

const HalamanPerubahanData: React.FC = () => {
  const [requests, setRequests] = useState<DataChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getDataChangeRequests();
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch data change requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (id: number, status: 'approved' | 'rejected') => {
    const reviewNotes = prompt(`Enter notes for ${status}:`);
    if (reviewNotes === null) return; // User cancelled

    try {
      await handleDataChangeRequest(id, status, reviewNotes);
      alert(`Request ${status} successfully.`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert(`Failed to ${status} request.`);
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data Change Requests</h1>
      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{req.employeeId}</td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-400">{req.requestedChanges}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => handleRequest(req.id, 'approved')} className="text-indigo-600 hover:text-indigo-900">Approve</button>
                      <button onClick={() => handleRequest(req.id, 'rejected')} className="ml-4 text-red-600 hover:text-red-900">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HalamanPerubahanData;
