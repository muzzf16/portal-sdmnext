import React from 'react';
import { Absensi } from '../types';

interface DaftarAbsensiPegawaiProps {
  absensi: Absensi[];
  loading: boolean;
  error: Error | null;
}

const DaftarAbsensiPegawai: React.FC<DaftarAbsensiPegawaiProps> = ({ absensi, loading, error }) => {
  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Tanggal</th>
            <th className="py-2 px-4 border-b">Jam Masuk</th>
            <th className="py-2 px-4 border-b">Jam Keluar</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Durasi Kerja</th>
          </tr>
        </thead>
        <tbody>
          {absensi.map(record => (
            <tr key={record.id}>
              <td className="py-2 px-4 border-b">{record.date}</td>
              <td className="py-2 px-4 border-b">{record.clockIn}</td>
              <td className="py-2 px-4 border-b">{record.clockOut}</td>
              <td className="py-2 px-4 border-b">{record.status}</td>
              <td className="py-2 px-4 border-b">{record.workDuration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaftarAbsensiPegawai;
