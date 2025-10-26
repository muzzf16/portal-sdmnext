import React from 'react';
import DaftarNotifikasi from '../components/DaftarNotifikasi';
import { useAuth } from '@/shared/contexts/AuthContext'; // Import useAuth

const HalamanNotifikasi: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  if (authLoading) {
    return <div>Memuat informasi pengguna...</div>;
  }

  // Use user.id as employeeId, or a default/error state if user is not available
  const employeeId = user?.id || null; 

  if (!employeeId) {
    return <div>Tidak dapat memuat notifikasi: ID pengguna tidak tersedia.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Notifikasi</h1>
      <DaftarNotifikasi employeeId={employeeId} />
    </div>
  );
};

export default HalamanNotifikasi;
