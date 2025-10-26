import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRiwayatJabatan } from '../../../shared/services/kontrakAPI';
import { RiwayatJabatan } from '../../../shared/types/types';

const HalamanRiwayatJabatanPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [riwayatJabatan, setRiwayatJabatan] = useState<RiwayatJabatan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiwayatJabatan = async () => {
      try {
        const response = await getRiwayatJabatan(id as string);
        setRiwayatJabatan(response.data);
      } catch (err) {
        setError('Gagal mengambil riwayat jabatan');
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayatJabatan();
  }, [id]);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Riwayat Jabatan Pegawai</h1>
      {riwayatJabatan.length === 0 ? (
        <p>Tidak ada riwayat jabatan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Jabatan Lama</th>
                <th className="py-2 px-4 border-b">Jabatan Baru</th>
                <th className="py-2 px-4 border-b">Tanggal Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {riwayatJabatan.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{item.jabatan_lama}</td>
                  <td className="py-2 px-4 border-b text-center">{item.jabatan_baru}</td>
                  <td className="py-2 px-4 border-b text-center">{new Date(item.tanggal_perubahan).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HalamanRiwayatJabatanPegawai;
