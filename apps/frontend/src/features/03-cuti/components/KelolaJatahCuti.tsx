import React from 'react';
import { Table, Badge } from '@/shared/components/ui';
import { useCutiBersama } from '../hooks/useLeaveQuery';
import { useCompanySettings } from '../../pengaturan/hooks/useCompanySettings';

const KelolaJatahCuti: React.FC = () => {
  const { data: companySettings, isLoading: settingsLoading } = useCompanySettings();
  const { data: cutiBersama, isLoading: cutiLoading } = useCutiBersama();

  if (settingsLoading || cutiLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-64 mb-4" />
        <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded w-48 mb-6" />
        <div className="h-32 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  const jumlahJatahCuti = companySettings?.annualLeaveQuota || 12;

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mb-8 mt-6">
      <h2 className="text-xl font-bold text-primary-dark-blue dark:text-white mb-4">Informasi Jatah Cuti Tahunan</h2>

      {/* Info Jatah Cuti */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Jatah Cuti Tahunan</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">{jumlahJatahCuti} hari</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
            Sumber: {companySettings ? 'Pengaturan Perusahaan' : 'Default UU 13/2003'}
          </p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Cuti Bersama Tahun Ini</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">{cutiBersama?.length || 0} hari</p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Sisa Jatah Efektif</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
            {jumlahJatahCuti - (cutiBersama?.length || 0)} hari
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">(Jatah − Cuti Bersama)</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          💡 Untuk mengubah jatah cuti, buka menu <strong>Pengaturan → Pengaturan Cuti</strong>
        </p>
      </div>

      {/* Daftar cuti bersama */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Daftar Cuti Bersama</h3>
        {cutiBersama && cutiBersama.length > 0 ? (
          <Table headers={['Tanggal', 'Deskripsi']}>
            {cutiBersama.map((cuti) => (
              <tr key={cuti.id}>
                <td className="py-3 px-4">
                  <Badge variant="secondary">
                    {new Date(cuti.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Badge>
                </td>
                <td className="py-3 px-4">{cuti.deskripsi}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Belum ada cuti bersama yang ditetapkan untuk tahun ini.</p>
        )}
      </div>
    </div>
  );
};

export default KelolaJatahCuti;