import React from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKontrak } from '../hooks/useDaftarKontrak';

const DaftarKontrak: React.FC = () => {
  const { daftarKontrak, loading, error } = useDaftarKontrak();

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID Pegawai</th>
            <th className="py-2 px-4 border-b">Posisi</th>
            <th className="py-2 px-4 border-b">Tanggal Mulai</th>
            <th className="py-2 px-4 border-b">Tanggal Berakhir</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(daftarKontrak) && daftarKontrak.map(kontrak => (
            <tr key={kontrak.id}>
              <td className="py-2 px-4 border-b">{kontrak.employeeId}</td>
              <td className="py-2 px-4 border-b">{kontrak.position}</td>
              <td className="py-2 px-4 border-b">{kontrak.startDate}</td>
              <td className="py-2 px-4 border-b">{kontrak.endDate}</td>
              <td className="py-2 px-4 border-b">{kontrak.status}</td>
              <td className="py-2 px-4 border-b">
                <Link to={`/dashboard/kontrak/${kontrak.id}`} className="text-blue-500 hover:underline">Lihat</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarKontrak;
