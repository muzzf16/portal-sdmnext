import React from 'react';
import { useAbsensi } from '../hooks/useAbsensi';
import { Table, Badge } from '@/shared/components/ui';

const DaftarAbsensi: React.FC = () => {
  const { absensi, loading, error } = useAbsensi();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Durasi Kerja'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {absensi.map(record => (
          <tr key={record.id}>
            <td className="py-4 px-6">{record.employeeName}</td>
            <td className="py-4 px-6">{record.date}</td>
            <td className="py-4 px-6">{record.clockIn || '-'}</td>
            <td className="py-4 px-6">{record.clockOut || '-'}</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  record.status === 'hadir' ? 'success' : 
                  record.status === 'izin' ? 'info' : 
                  record.status === 'sakit' ? 'warning' : 
                  record.status === 'cuti' ? 'secondary' : 'danger'
                }
              >
                {record.status}
              </Badge>
            </td>
            <td className="py-4 px-6">{record.workDuration || '-'}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarAbsensi;
