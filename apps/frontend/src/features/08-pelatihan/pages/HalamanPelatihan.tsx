import React from 'react';
import DaftarPelatihan from '../components/DaftarPelatihan';

const HalamanPelatihan: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Pelatihan</h1>

      <DaftarPelatihan />
    </div>
  );
};

export default HalamanPelatihan;
