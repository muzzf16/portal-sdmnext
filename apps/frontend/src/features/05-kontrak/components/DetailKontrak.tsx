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
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Gagal Memuat Kontrak</h2>
        <p className="text-gray-600 mb-6">
          Kontrak yang Anda cari tidak dapat ditemukan. Kemungkinan telah dihapus atau Anda memiliki tautan yang salah.
        </p>
        <a href="/dashboard/kontrak" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Kembali ke Daftar Kontrak
        </a>
      </div>
    );
  }
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
