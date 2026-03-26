import React from 'react';
import { useCutiSaya } from '../hooks/useCutiSaya';
import { normalizeLeaveStatusLabel } from '../hooks/useLeaveQuery';
import { Table, Badge } from '@/shared/components/ui';

const DaftarCutiSaya: React.FC = () => {
  const { cuti, loading, error } = useCutiSaya();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Jenis Cuti', 'Tanggal Mulai', 'Tanggal Selesai', 'Alasan', 'Status'];

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Pengajuan Cuti Saya</h2>
      <Table headers={tableHeaders}>
        {cuti.map(l => {
          const statusMeta = normalizeLeaveStatusLabel(l.status);

          return (
            <tr key={l.id}>
            <td className="py-4 px-6">{l.leaveType}</td>
            <td className="py-4 px-6">{l.startDate}</td>
            <td className="py-4 px-6">{l.endDate}</td>
            <td className="py-4 px-6">{l.reason}</td>
            <td className="py-4 px-6">
              <Badge variant={statusMeta.badge}>
                {statusMeta.label}
              </Badge>
            </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default DaftarCutiSaya;
