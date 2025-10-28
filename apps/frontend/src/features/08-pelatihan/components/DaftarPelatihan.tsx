import React from 'react';
import { usePelatihan } from '../hooks/usePelatihan';

const DaftarPelatihan: React.FC = () => {
  const { pelatihan, loading, error } = usePelatihan();

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama Pelatihan</th>
            <th className="py-2 px-4 border-b">Penyelenggara</th>
            <th className="py-2 px-4 border-b">Tanggal Mulai</th>
            <th className="py-2 px-4 border-b">Tanggal Selesai</th>
            <th className="py-2 px-4 border-b">Sertifikat</th>
          </tr>
        </thead>
        <tbody>
          {pelatihan.map(item => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.trainingName}</td>
              <td className="py-2 px-4 border-b">{item.organizer}</td>
              <td className="py-2 px-4 border-b">{item.startDate}</td>
              <td className="py-2 px-4 border-b">{item.endDate}</td>
              <td className="py-2 px-4 border-b">
                {item.certificate ? (
                  <a href={item.certificate} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Lihat
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarPelatihan;
