import React from 'react';
import DaftarKontrak from '../components/DaftarKontrak';
import FormKontrak from '../components/FormKontrak';

const HalamanKontrak: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Manajemen Kontrak & Jabatan</h1>
      <FormKontrak />
      <DaftarKontrak />
    </div>
  );
};

export default HalamanKontrak;
