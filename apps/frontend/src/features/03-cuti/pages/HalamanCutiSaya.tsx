import React from 'react';
import FormCuti from '../components/FormCuti';
import DaftarCutiSaya from '../components/DaftarCutiSaya';

const HalamanCutiSaya: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Cuti Saya</h1>
      <FormCuti />
      <DaftarCutiSaya />
    </div>
  );
};

export default HalamanCutiSaya;
