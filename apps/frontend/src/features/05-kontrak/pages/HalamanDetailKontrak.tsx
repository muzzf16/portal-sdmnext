import React from 'react';
import { useParams } from 'react-router-dom';
import DetailKontrak from '../components/DetailKontrak';

const HalamanDetailKontrak: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-dark-blue">Detail Kontrak</h1>
      <DetailKontrak contractId={id} />
    </div>
  );
};

export default HalamanDetailKontrak;
