import React, { useState, useMemo } from 'react';
import { Table, Badge } from '@/shared/components/ui';
import { useBatchSisaCuti } from '../hooks/useLeaveQuery';
import { Search } from 'lucide-react';

const PerhitunganSisaCuti: React.FC = () => {
  const { data: sisaCutiList, isLoading, error } = useBatchSisaCuti();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = useMemo(() => {
    if (!sisaCutiList) return [];
    if (!searchTerm.trim()) return sisaCutiList;
    const lower = searchTerm.toLowerCase();
    return sisaCutiList.filter((p) => p.employeeName.toLowerCase().includes(lower));
  }, [sisaCutiList, searchTerm]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mt-8 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-72 mb-4" />
        <div className="h-64 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mt-8">
        <p className="text-red-500">Gagal memuat data sisa cuti: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const tableHeaders = ['Nama Pegawai', 'Jatah Cuti', 'Cuti Diambil', 'Cuti Bersama', 'Sisa Cuti', 'Status'];

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-primary-dark-blue dark:text-white">Perhitungan Sisa Cuti Pegawai</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pegawai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 dark:text-white w-full sm:w-64"
          />
        </div>
      </div>

      {filteredList.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {searchTerm ? 'Tidak ditemukan pegawai yang cocok.' : 'Belum ada data pegawai.'}
        </p>
      ) : (
        <Table headers={tableHeaders}>
          {filteredList.map((pegawai) => (
            <tr key={pegawai.employeeId}>
              <td className="py-4 px-6 font-medium">{pegawai.employeeName}</td>
              <td className="py-4 px-6">{pegawai.jatahCuti} hari</td>
              <td className="py-4 px-6">{pegawai.cutiDiambil} hari</td>
              <td className="py-4 px-6">{pegawai.cutiBersama} hari</td>
              <td className="py-4 px-6 font-semibold">{pegawai.sisaCuti} hari</td>
              <td className="py-4 px-6">
                <Badge
                  variant={
                    pegawai.sisaCuti < 5 ? 'danger' :
                    pegawai.sisaCuti < 10 ? 'warning' : 'success'
                  }
                >
                  {pegawai.sisaCuti < 5 ? 'Sedikit' :
                   pegawai.sisaCuti < 10 ? 'Cukup' : 'Banyak'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default PerhitunganSisaCuti;
