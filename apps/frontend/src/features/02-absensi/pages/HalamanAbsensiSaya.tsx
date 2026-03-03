import React from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import DaftarAbsensiPegawai from '../components/DaftarAbsensiPegawai';
import CatatWaktu from '../components/CatatWaktu';
import { useAbsensiPegawai } from '../hooks/useAbsensiPegawai';

const HalamanAbsensiSaya: React.FC = () => {
  const { user } = useAuth();
  const { absensi, loading, error, refetch } = useAbsensiPegawai(user?.employeeId || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Absensi Saya</h1>
          <p className="text-gray-500 mt-1">Pantau kehadiran dan riwayat absensi bulanan Anda.</p>
        </div>
      </div>
      {user && user.employeeId && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <CatatWaktu employeeId={user.employeeId} employeeName={user.name} onSuccess={refetch} />
        </div>
      )}
      <DaftarAbsensiPegawai absensi={absensi} loading={loading} error={error} />
    </div>
  );
};

export default HalamanAbsensiSaya;
