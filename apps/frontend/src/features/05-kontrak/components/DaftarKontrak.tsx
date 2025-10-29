import React from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKontrak } from '../hooks/useDaftarKontrak';
import { Table, Badge } from '@/shared/components/ui';

const DaftarKontrak: React.FC = () => {
  const { daftarKontrak, loading, error } = useDaftarKontrak();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['ID Pegawai', 'Posisi', 'Tanggal Mulai', 'Tanggal Berakhir', 'Status', 'Aksi'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {Array.isArray(daftarKontrak) && daftarKontrak.map(kontrak => (
          <tr key={kontrak.id}>
            <td className="py-4 px-6">{kontrak.employeeId}</td>
            <td className="py-4 px-6">{kontrak.position}</td>
            <td className="py-4 px-6">{new Date(kontrak.startDate).toLocaleDateString('id-ID')}</td>
            <td className="py-4 px-6">{new Date(kontrak.endDate).toLocaleDateString('id-ID')}</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  kontrak.status === 'aktif' ? 'success' : 
                  kontrak.status === 'expiring' ? 'warning' : 
                  kontrak.status === 'expired' ? 'danger' : 'secondary'
                }
              >
                {kontrak.status}
              </Badge>
            </td>
            <td className="py-4 px-6">
              <Link 
                to={`/dashboard/kontrak/${kontrak.id}`} 
                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
              >
                Lihat Detail
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarKontrak;
