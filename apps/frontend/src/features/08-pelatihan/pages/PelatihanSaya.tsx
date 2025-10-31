import React from 'react';
import TambahPelatihanForm from '../components/TambahPelatihanForm';
import DaftarPelatihan from '../components/DaftarPelatihan';

const PelatihanSaya: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-6">Pelatihan Saya</h1>
      <TambahPelatihanForm />
      <DaftarPelatihan />
    </div>
  );
};

export default PelatihanSaya;