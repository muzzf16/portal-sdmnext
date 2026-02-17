import React from 'react';
import DaftarPenggajian from '../components/DaftarPenggajian';

const HalamanPenggajian: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Penggajian</h1>
        <p className="text-gray-600">Kelola data gaji, tunjangan, dan potongan pegawai.</p>
      </div>
      <DaftarPenggajian />
    </div>
  );
};

export default HalamanPenggajian;
