import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPelatihan } from '../../../shared/services/pelatihanAPI';
import { Pelatihan } from '../../../shared/types/types';
import { Table } from '@/shared/components/ui';

const HalamanPelatihanPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPelatihan = async () => {
      try {
        const response = await getPelatihan(id as string);
        // Map the response to handle both naming conventions (English and Indonesian)
        const mappedData = (response.data || []).map(item => {
          return {
            id: Number(item.id) || Number(item.id),
            pegawai_id: Number(item.pegawai_id) || Number(item.employeeId),
            nama_pelatihan: item.nama_pelatihan || item.trainingName,
            penyelenggara: item.penyelenggara || item.organizer,
            tanggal_mulai: item.tanggal_mulai || item.startDate,
            tanggal_selesai: item.tanggal_selesai || item.endDate,
            nomor_sertifikat: item.nomor_sertifikat || item.certificate,
          } as Pelatihan;
        });
        setPelatihan(mappedData);
      } catch (err) {
        setError('Gagal mengambil data pelatihan');
      } finally {
        setLoading(false);
      }
    };

    fetchPelatihan();
  }, [id]);

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  const tableHeaders = ['Nama Pelatihan', 'Penyelenggara', 'Tanggal Mulai', 'Tanggal Selesai', 'Nomor Sertifikat'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Riwayat Pelatihan Pegawai</h1>
      {pelatihan.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Tidak ada riwayat pelatihan.</p>
        </div>
      ) : (
        <Table headers={tableHeaders}>
          {pelatihan.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
              <td className="py-4 px-6 text-center">{item.nama_pelatihan}</td>
              <td className="py-4 px-6 text-center">{item.penyelenggara}</td>
              <td className="py-4 px-6 text-center">{new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</td>
              <td className="py-4 px-6 text-center">{new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</td>
              <td className="py-4 px-6 text-center">{item.nomor_sertifikat || '-'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default HalamanPelatihanPegawai;
