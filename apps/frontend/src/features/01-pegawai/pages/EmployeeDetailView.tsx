import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import ProfilSaya from '../components/ProfilSaya';
import HalamanDetailPegawai from './HalamanDetailPegawai';

const EmployeeDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  // Show loading state if authentication is still loading
  if (loading) {
    return <div>Memuat...</div>;
  }

  // If there's no ID in the URL, show an error message
  if (!id) {
    return <div>ID pegawai tidak ditemukan dalam URL</div>;
  }

  // If the user is an employee and they're viewing their own profile, show ProfilSaya
  if (user?.role === 'employee' && user?.employeeId === id) {
    return <ProfilSaya />;
  }

  // For all other cases (admins viewing any profile, employees viewing other profiles), show the detail page
  return <HalamanDetailPegawai />;
};

export default EmployeeDetailView;