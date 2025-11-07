import React from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import DaftarAbsensiPegawai from '../components/DaftarAbsensiPegawai';
import CatatWaktu from '../components/CatatWaktu';
import { useAbsensiPegawai } from '../hooks/useAbsensiPegawai';

const HalamanAbsensiSaya: React.FC = () => {
  const { user } = useAuth();
  const { absensi, loading, error, refetch } = useAbsensiPegawai(user?.employeeId || '');

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-4">Absensi Saya</h1>
      {user && user.employeeId && <CatatWaktu employeeId={user.employeeId} employeeName={user.name} onSuccess={refetch} />}
      <DaftarAbsensiPegawai absensi={absensi} loading={loading} error={error} />
    </div>
  );
};

export default HalamanAbsensiSaya;
