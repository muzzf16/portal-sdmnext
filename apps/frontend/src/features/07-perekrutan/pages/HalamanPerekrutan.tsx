import React from 'react';
import DaftarLamaran from '../components/DaftarLamaran';
import FormLamaran from '../components/FormLamaran';

const HalamanPerekrutan: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Rekrutmen & Orientasi</h1>
      <FormLamaran />
      <DaftarLamaran />
    </div>
  );
};

export default HalamanPerekrutan;
