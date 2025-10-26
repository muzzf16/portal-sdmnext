import React from 'react';
import { useParams } from 'react-router-dom';
import DetailKinerja from '../components/DetailKinerja';

const HalamanDetailKinerja: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Detail Penilaian Kinerja</h1>
      <DetailKinerja performanceId={id} />
    </div>
  );
};

export default HalamanDetailKinerja;
