import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPelatihan } from '../../../shared/services/pelatihanAPI';
import { Pelatihan } from '../../../shared/types/types';

const HalamanPelatihanPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPelatihan = async () => {
      try {
        const response = await getPelatihan(id as string);
        setPelatihan(response.data);
      } catch (err) {
        setError('Gagal mengambil data pelatihan');
      } finally {
        setLoading(false);
      }
    };

    fetchPelatihan();
  }, [id]);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Riwayat Pelatihan Pegawai</h1>
      {pelatihan.length === 0 ? (
        <p>Tidak ada riwayat pelatihan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nama Pelatihan</th>
                <th className="py-2 px-4 border-b">Penyelenggara</th>
                <th className="py-2 px-4 border-b">Tanggal Mulai</th>
                <th className="py-2 px-4 border-b">Tanggal Selesai</th>
                <th className="py-2 px-4 border-b">Nomor Sertifikat</th>
              </tr>
            </thead>
            <tbody>
              {pelatihan.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{item.nama_pelatihan}</td>
                  <td className="py-2 px-4 border-b text-center">{item.penyelenggara}</td>
                  <td className="py-2 px-4 border-b text-center">{new Date(item.tanggal_mulai).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b text-center">{new Date(item.tanggal_selesai).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b text-center">{item.nomor_sertifikat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HalamanPelatihanPegawai;
