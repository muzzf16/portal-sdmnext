import React from 'react';
import { useDaftarLamaran } from '../hooks/useDaftarLamaran';
import { Table, Badge } from '@/shared/components/ui';

const DaftarLamaran: React.FC = () => {
  const { daftarLamaran, loading, error } = useDaftarLamaran();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama', 'Email', 'Posisi Dilamar', 'Status'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {daftarLamaran.map(lamaran => (
          <tr key={lamaran.id}>
            <td className="py-4 px-6">{lamaran.name}</td>
            <td className="py-4 px-6">{lamaran.email}</td>
            <td className="py-4 px-6">{lamaran.positionApplied}</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  lamaran.status === 'Applied' ? 'secondary' : 
                  lamaran.status === 'Interviewing' ? 'info' : 
                  lamaran.status === 'Offered' ? 'warning' : 
                  lamaran.status === 'Hired' ? 'success' : 
                  lamaran.status === 'Rejected' ? 'danger' : 'secondary'
                }
              >
                {lamaran.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarLamaran;
