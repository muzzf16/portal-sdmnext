import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDaftarPenggajian } from '../hooks/useDaftarPenggajian';
import { Table, Button } from '@/shared/components/ui';
import FormInputGaji from './FormInputGaji';

const DaftarPenggajian: React.FC = () => {
  const { daftarPenggajian, loading, error, fetchPenggajian } = useDaftarPenggajian();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchPenggajian();
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Periode', 'Gaji Bersih', 'Aksi'];

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>Input Gaji</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FormInputGaji onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
        </div>
      )}

      <Table headers={tableHeaders}>
        {daftarPenggajian.map(penggajian => (
          <tr key={penggajian.id}>
            <td className="py-4 px-6">{penggajian.employeeName}</td>
            <td className="py-4 px-6">{penggajian.period}</td>
            <td className="py-4 px-6">{new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(penggajian.netSalary)}</td>
            <td className="py-4 px-6">
              <Link 
                to={`/dashboard/penggajian/${penggajian.id}`} 
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

export default DaftarPenggajian;
