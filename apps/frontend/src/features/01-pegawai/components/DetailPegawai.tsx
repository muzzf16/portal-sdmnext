import React from 'react';
import { usePegawai } from '../hooks/usePegawai';
import { Link } from 'react-router-dom';

interface DetailPegawaiProps {
  employeeId: string | undefined;
}

const DetailPegawai: React.FC<DetailPegawaiProps> = ({ employeeId }) => {
  if (!employeeId) {
    return <div>Pegawai tidak ditemukan</div>;
  }

  const { pegawai, loading, error } = usePegawai(employeeId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pegawai) return <div>Pegawai tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary-dark-blue mb-4">{pegawai.name}</h2>
        <p><strong>Posisi:</strong> {pegawai.position}</p>
        <p><strong>Departemen:</strong> {pegawai.department}</p>
        {/* Add more employee details here */}

        <div className="mt-6 flex space-x-4">
          <Link to={`/dashboard/pegawai/${employeeId}/riwayat-jabatan`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Riwayat Jabatan
          </Link>
          <Link to={`/dashboard/pegawai/${employeeId}/pelatihan`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Riwayat Pelatihan
          </Link>
          <Link to={`/dashboard/pegawai/${employeeId}/orientasi`} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Tugas Orientasi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailPegawai;
