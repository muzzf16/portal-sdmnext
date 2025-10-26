import React from 'react';
import CatatWaktu from '../components/CatatWaktu';
import DaftarAbsensi from '../components/DaftarAbsensi';

const HalamanAbsensi: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Absensi & Kehadiran</h1>
      <CatatWaktu />
      <DaftarAbsensi />
    </div>
  );
};

export default HalamanAbsensi;
