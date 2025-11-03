import React from 'react';
import { useKinerja } from '../hooks/useKinerja';

interface DetailKinerjaProps {
  performanceId: string | undefined;
}

const DetailKinerja: React.FC<DetailKinerjaProps> = ({ performanceId }) => {
  if (!performanceId) {
    return <div>Penilaian kinerja tidak ditemukan</div>;
  }

  const { kinerja, loading, error } = useKinerja(performanceId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!kinerja) return <div>Penilaian kinerja tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary-dark-blue mb-4">{kinerja.employeeName} - {kinerja.period}</h2>
        <p><strong>Skor Keseluruhan:</strong> {kinerja.overallScore}</p>
        <p><strong>Status:</strong> {kinerja.status}</p>
        {kinerja.penilaiId && <p><strong>ID Penilai:</strong> {kinerja.penilaiId}</p>}
        {kinerja.createdAt && <p><strong>Tanggal Dibuat:</strong> {new Date(kinerja.createdAt).toLocaleString()}</p>}
        {/* Add more performance details here */}
      </div>
    </div>
  );
};

export default DetailKinerja;
