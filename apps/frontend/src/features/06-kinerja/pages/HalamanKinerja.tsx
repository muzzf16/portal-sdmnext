import React from 'react';
import DaftarKinerja from '../components/DaftarKinerja';
import FormKinerja from '../components/FormKinerja';

const HalamanKinerja: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Penilaian Kinerja</h1>
      <FormKinerja />
      <DaftarKinerja />
    </div>
  );
};

export default HalamanKinerja;
