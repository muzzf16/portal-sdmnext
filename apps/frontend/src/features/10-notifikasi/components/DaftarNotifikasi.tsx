import React from 'react';
import { useDaftarNotifikasi } from '../hooks/useDaftarNotifikasi';

interface DaftarNotifikasiProps {
  employeeId: string;
}

const DaftarNotifikasi: React.FC<DaftarNotifikasiProps> = ({ employeeId }) => {
  const { daftarNotifikasi, loading, error, markAsRead } = useDaftarNotifikasi(employeeId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-8">
      <ul className="space-y-4">
        {Array.isArray(daftarNotifikasi) && daftarNotifikasi.map(notifikasi => (
          <li key={notifikasi.id} className={`p-4 rounded-md ${notifikasi.is_read ? 'bg-slate-100' : 'bg-blue-100'}`}>
            <h3 className="font-bold">{notifikasi.message}</h3>
            <p>Tipe: {notifikasi.type}</p>
            <span className="text-sm text-slate-500">{new Date(notifikasi.created_at).toLocaleString()}</span>
            {!notifikasi.is_read && (
              <button onClick={() => markAsRead(notifikasi.id)} className="ml-4 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Tandai Sudah Dibaca
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DaftarNotifikasi;
