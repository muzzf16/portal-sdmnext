import React from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import DaftarAbsensiPegawai from '../components/DaftarAbsensiPegawai';

const HalamanAbsensiSaya: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-4">Absensi Saya</h1>
      {user && <DaftarAbsensiPegawai employeeId={user.employeeId} />}
    </div>
  );
};

export default HalamanAbsensiSaya;
