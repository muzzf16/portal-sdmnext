import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDaftarPenggajian } from '../hooks/useDaftarPenggajian';
import { Table, Button, Input } from '@/shared/components/ui';
import MonthPicker from '@/shared/components/ui/MonthPicker';
import FormInputGaji from './FormInputGaji';

const DaftarPenggajian: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const { daftarPenggajian, loading, error, fetchPenggajian } = useDaftarPenggajian(searchTerm, filterPeriod);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchPenggajian();
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;



  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Input
            id="search"
            label="Cari Nama Pegawai"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari..."
          />
          <div className="w-48">
            <MonthPicker
              value={filterPeriod}
              onChange={setFilterPeriod}
              label="Filter Periode"
            />
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Input Gaji</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FormInputGaji onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
        </div>
      )}

      <Table headers={['Nama Pegawai', 'Periode', 'Gaji Bersih', 'Status', 'Aksi']}>
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
              <span className={`px-2 py-1 text-xs rounded-full font-bold ${penggajian.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                penggajian.status === 'Final' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                {penggajian.status || 'Draft'}
              </span>
            </td>
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
