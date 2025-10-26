import React from 'react';
import { useDaftarLamaran } from '../hooks/useDaftarLamaran';

const DaftarLamaran: React.FC = () => {
  const { daftarLamaran, loading, error } = useDaftarLamaran();

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Posisi Dilamar</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {daftarLamaran.map(lamaran => (
            <tr key={lamaran.id}>
              <td className="py-2 px-4 border-b">{lamaran.name}</td>
              <td className="py-2 px-4 border-b">{lamaran.email}</td>
              <td className="py-2 px-4 border-b">{lamaran.positionApplied}</td>
              <td className="py-2 px-4 border-b">{lamaran.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarLamaran;
