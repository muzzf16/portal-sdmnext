import React from 'react';
import DaftarAbsensi from '../components/DaftarAbsensi';
import ExcelUpload from '../components/ExcelUpload';

const HalamanAbsensi: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Absensi & Kehadiran</h1>
      <ExcelUpload />
      <DaftarAbsensi />
    </div>
  );
};

export default HalamanAbsensi;
