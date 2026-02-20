import React from 'react';
import { usePelatihan } from '../hooks/usePelatihan';
import { Table } from '@/shared/components/ui';

const VITE_API_URL = import.meta.env.VITE_API_BASE || '';

const DaftarPelatihan: React.FC = () => {
  const { pelatihan, loading, error } = usePelatihan();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pelatihan', 'Penyelenggara', 'Tanggal Mulai', 'Tanggal Selesai', 'Sertifikat'];

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Seluruh Pelatihan</h2>
      <Table headers={tableHeaders}>
        {pelatihan.map(item => (
          <tr key={item.id}>
            <td className="py-4 px-6">{item.nama_pelatihan}</td>
            <td className="py-4 px-6">{item.penyelenggara}</td>
            <td className="py-4 px-6">{new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</td>
            <td className="py-4 px-6">{new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</td>
            <td className="py-4 px-6">
              {item.nomor_sertifikat ? (
                <a
                  href={`${VITE_API_URL}/documents/${item.nomor_sertifikat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
                >
                  Lihat Sertifikat
                </a>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarPelatihan;
