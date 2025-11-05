import React from 'react';
import { useAbsensi } from '../hooks/useAbsensi';
import { Table, Badge, Button } from '@/shared/components/ui';
import * as XLSX from 'xlsx';

const DaftarAbsensi: React.FC = () => {
  const { absensi, loading, error } = useAbsensi();

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Status', 'Durasi Kerja'];

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(absensi.map(item => ({
      'Nama Pegawai': item.employeeName,
      'Tanggal': item.date,
      'Jam Masuk': item.clockIn,
      'Jam Keluar': item.clockOut,
      'Status': item.status,
      'Durasi Kerja': item.workDuration
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Oktober 2025');
    XLSX.writeFile(workbook, 'oktober2025.xls');
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport}>Export to Excel</Button>
      </div>
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
