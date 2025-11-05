import React from 'react';
import { useParams } from 'react-router-dom';
import { DetailPenggajian } from '../components/DetailPenggajian';

const HalamanDetailPenggajian: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Detail Penggajian</h1>
      <DetailPenggajian payrollId={id} />
    </div>
  );
};

export default HalamanDetailPenggajian;
