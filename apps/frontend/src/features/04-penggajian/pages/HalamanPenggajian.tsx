import React from 'react';
import DaftarPenggajian from '../components/DaftarPenggajian';

const HalamanPenggajian: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Penggajian</h1>
      <DaftarPenggajian />
    </div>
  );
};

export default HalamanPenggajian;
