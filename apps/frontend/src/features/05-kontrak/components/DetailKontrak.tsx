import React from 'react';
import { Link } from 'react-router-dom';
import { useKontrak } from '../hooks/useKontrak';
import { Badge } from '@/shared/components/ui';

interface DetailKontrakProps {
  contractId: string | undefined;
}

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'secondary' => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'active' || statusLower === 'aktif') return 'success';
  if (statusLower === 'expiring' || statusLower === 'akan berakhir') return 'warning';
  if (statusLower === 'expired' || statusLower === 'berakhir') return 'danger';
  return 'secondary';
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Aktif',
    'aktif': 'Aktif',
    'expiring': 'Akan Berakhir',
    'akan berakhir': 'Akan Berakhir',
    'expired': 'Berakhir',
    'berakhir': 'Berakhir',
    'terminated': 'Dihentikan',
    'dihentikan': 'Dihentikan'
  };
  return statusMap[status.toLowerCase()] || status;
};

const DetailKontrak: React.FC<DetailKontrakProps> = ({ contractId }) => {
  if (!contractId) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Kontrak Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">ID kontrak tidak valid.</p>
        <Link to="/dashboard/kontrak" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Kembali ke Daftar Kontrak
        </Link>
      </div>
    );
  }

  const { kontrak, loading, error } = useKontrak(contractId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (error || !kontrak) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Gagal Memuat Kontrak</h2>
        <p className="text-gray-600 mb-6">
          Kontrak yang Anda cari tidak dapat ditemukan. Kemungkinan telah dihapus atau Anda memiliki tautan yang salah.
        </p>
        <Link to="/dashboard/kontrak" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Kembali ke Daftar Kontrak
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-primary-dark-blue dark:text-white">
            Detail Kontrak
          </h2>
          <Badge variant={getStatusVariant(kontrak.status)}>
            {getStatusLabel(kontrak.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nama Pegawai</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {kontrak.employeeName || kontrak.employeeId}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">ID Pegawai</h3>
            <p className="text-lg text-gray-900 dark:text-white">{kontrak.employeeId}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Posisi</h3>
            <p className="text-lg text-gray-900 dark:text-white">{kontrak.position || 'N/A'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Departemen</h3>
            <p className="text-lg text-gray-900 dark:text-white">{kontrak.department || 'N/A'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Jenis Kontrak</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {kontrak.contractType === 'permanent' ? 'Permanen' :
               kontrak.contractType === 'temporary' ? 'Sementara' :
               kontrak.contractType === 'contract' ? 'Kontrak' : kontrak.contractType}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gaji</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {kontrak.salary ? `Rp ${kontrak.salary.toLocaleString('id-ID')}` : 'N/A'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Mulai</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {new Date(kontrak.startDate).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tanggal Berakhir</h3>
            <p className="text-lg text-gray-900 dark:text-white">
              {new Date(kontrak.endDate).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {kontrak.terms && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ketentuan</h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{kontrak.terms}</p>
            </div>
          )}

          {kontrak.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Catatan</h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{kontrak.notes}</p>
            </div>
          )}

          {kontrak.contractFile && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dokumen Kontrak</h3>
              <a
                href={kontrak.contractFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              >
                Lihat Dokumen
              </a>
            </div>
          )}

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dibuat Pada</h3>
            <p className="text-gray-900 dark:text-white">
              {kontrak.createdAt
                ? new Date(kontrak.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
          <Link
            to="/dashboard/kontrak"
            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
          >
            Kembali ke Daftar Kontrak
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailKontrak;
