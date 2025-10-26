import React from 'react';
import DaftarCuti from '../components/DaftarCuti';
import FormCuti from '../components/FormCuti';

const HalamanCuti: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Cuti & Izin</h1>
      <FormCuti />
      <DaftarCuti />
    </div>
  );
};

export default HalamanCuti;
