import React from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKinerja } from '../hooks/useDaftarKinerja';
import { Table, Badge } from '@/shared/components/ui';

const DaftarKinerja: React.FC = () => {
  const { daftarKinerja, loading, error } = useDaftarKinerja();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Periode', 'Skor Keseluruhan', 'Status', 'Aksi'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {daftarKinerja.map(kinerja => (
          <tr key={kinerja.id}>
            <td className="py-4 px-6">{kinerja.employeeName}</td>
            <td className="py-4 px-6">{kinerja.period}</td>
            <td className="py-4 px-6">{kinerja.overallScore}</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  kinerja.status === 'Completed' ? 'success' : 
                  kinerja.status === 'Draft' ? 'secondary' : 
                  kinerja.status === 'In Review' ? 'warning' : 'info'
                }
              >
                {kinerja.status}
              </Badge>
            </td>
            <td className="py-4 px-6">
              <Link 
                to={`/dashboard/kinerja/${kinerja.id}`} 
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

export default DaftarKinerja;
