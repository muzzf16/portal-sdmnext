import React from 'react';
import { useParams } from 'react-router-dom';
import DaftarAbsensiPegawai from '../components/DaftarAbsensiPegawai';

const HalamanAbsensiPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Absensi Pegawai</h1>
      <DaftarAbsensiPegawai employeeId={id} />
    </div>
  );
};

export default HalamanAbsensiPegawai;
