import React from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKinerja } from '../hooks/useDaftarKinerja';

const DaftarKinerja: React.FC = () => {
  const { daftarKinerja, loading, error } = useDaftarKinerja();

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama Pegawai</th>
            <th className="py-2 px-4 border-b">Periode</th>
            <th className="py-2 px-4 border-b">Skor Keseluruhan</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarKinerja.map(kinerja => (
            <tr key={kinerja.id}>
              <td className="py-2 px-4 border-b">{kinerja.employeeName}</td>
              <td className="py-2 px-4 border-b">{kinerja.period}</td>
              <td className="py-2 px-4 border-b">{kinerja.overallScore}</td>
              <td className="py-2 px-4 border-b">{kinerja.status}</td>
              <td className="py-2 px-4 border-b">
                <Link to={`/dashboard/kinerja/${kinerja.id}`} className="text-blue-500 hover:underline">Lihat</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarKinerja;
