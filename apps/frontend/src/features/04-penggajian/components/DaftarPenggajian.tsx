import React from 'react';
import { Link } from 'react-router-dom';
import { useDaftarPenggajian } from '../hooks/useDaftarPenggajian';

const DaftarPenggajian: React.FC = () => {
  const { daftarPenggajian, loading, error } = useDaftarPenggajian();

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nama Pegawai</th>
            <th className="py-2 px-4 border-b">Periode</th>
            <th className="py-2 px-4 border-b">Gaji Bersih</th>
            <th className="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarPenggajian.map(penggajian => (
            <tr key={penggajian.id}>
              <td className="py-2 px-4 border-b">{penggajian.employeeName}</td>
              <td className="py-2 px-4 border-b">{penggajian.period}</td>
              <td className="py-2 px-4 border-b">{penggajian.netSalary}</td>
              <td className="py-2 px-4 border-b">
                <Link to={`/dashboard/penggajian/${penggajian.id}`} className="text-blue-500 hover:underline">Lihat</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarPenggajian;
