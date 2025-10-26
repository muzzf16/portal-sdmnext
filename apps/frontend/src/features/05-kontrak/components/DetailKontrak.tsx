import React from 'react';
import { useKontrak } from '../hooks/useKontrak';

interface DetailKontrakProps {
  contractId: string | undefined;
}

const DetailKontrak: React.FC<DetailKontrakProps> = ({ contractId }) => {
  if (!contractId) {
    return <div>Kontrak tidak ditemukan</div>;
  }

  const { kontrak, loading, error } = useKontrak(contractId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!kontrak) return <div>Kontrak tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary-dark-blue mb-4">Kontrak untuk ID Pegawai: {kontrak.employeeId}</h2>
        <p><strong>Posisi:</strong> {kontrak.position}</p>
        <p><strong>Tanggal Mulai:</strong> {kontrak.startDate}</p>
        <p><strong>Tanggal Berakhir:</strong> {kontrak.endDate}</p>
        <p><strong>Status:</strong> {kontrak.status}</p>
        {/* Add more contract details here */}
      </div>
    </div>
  );
};

export default DetailKontrak;
