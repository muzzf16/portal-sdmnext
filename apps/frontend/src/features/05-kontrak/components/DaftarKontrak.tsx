import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKontrak } from '../hooks/useDaftarKontrak';
import { Table, Badge } from '@/shared/components/ui';
import { Trash2 } from 'lucide-react';
import { deleteKontrak } from '../api/kontrakApi';
import { useToast } from '@/app/providers/ToastContext';

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

interface DaftarKontrakProps {
  key?: number;
}

const DaftarKontrak: React.FC<DaftarKontrakProps> = () => {
  const { daftarKontrak, loading, error, refetch } = useDaftarKontrak();
  const { addToast } = useToast();

  // Refetch when component remounts (when key changes)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kontrak ini?')) {
      try {
        await deleteKontrak(id);
        addToast('Kontrak berhasil dihapus', 'success');
        refetch();
      } catch (error) {
        console.error('Failed to delete contract:', error);
        addToast('Gagal menghapus kontrak', 'error');
      }
    }
  };

  const tableHeaders = useMemo(() => [
    'Nama Pegawai', 'ID Pegawai', 'Posisi', 'Tanggal Mulai', 'Tanggal Berakhir', 'Status', 'Aksi'
  ], []);

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {Array.isArray(daftarKontrak) && daftarKontrak.length > 0 ? (
          daftarKontrak.map(kontrak => (
            <tr key={kontrak.id}>
              <td className="py-4 px-6">{kontrak.employeeName || 'N/A'}</td>
              <td className="py-4 px-6">{kontrak.employeeId}</td>
              <td className="py-4 px-6">{kontrak.position || 'N/A'}</td>
              <td className="py-4 px-6">
                {new Date(kontrak.startDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td className="py-4 px-6">
                {new Date(kontrak.endDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td className="py-4 px-6">
                <Badge variant={getStatusVariant(kontrak.status)}>
                  {getStatusLabel(kontrak.status)}
                </Badge>
              </td>
              <td className="py-4 px-6">
                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/kontrak/${kontrak.id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
                  >
                    Lihat Detail
                  </Link>
                  <button
                    onClick={() => handleDelete(kontrak.id)}
                    className="inline-flex items-center px-3 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={tableHeaders.length} className="py-8 text-center text-gray-500">
              Tidak ada kontrak yang ditemukan
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};

export default DaftarKontrak;
