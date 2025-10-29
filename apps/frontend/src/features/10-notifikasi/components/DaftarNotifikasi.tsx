import React from 'react';
import { useDaftarNotifikasi } from '../hooks/useDaftarNotifikasi';
import { Table, Badge, Button } from '@/shared/components/ui';

interface DaftarNotifikasiProps {
  employeeId: string;
}

const DaftarNotifikasi: React.FC<DaftarNotifikasiProps> = ({ employeeId }) => {
  const { daftarNotifikasi, loading, error, markAsRead } = useDaftarNotifikasi(employeeId);

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Pesan', 'Tipe', 'Tanggal', 'Status', 'Aksi'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {Array.isArray(daftarNotifikasi) && daftarNotifikasi.map(notifikasi => (
          <tr key={notifikasi.id} className={notifikasi.is_read ? '' : 'bg-blue-50'}>
            <td className="py-4 px-6 font-medium">{notifikasi.message}</td>
            <td className="py-4 px-6">
              <Badge variant={
                notifikasi.type === 'info' ? 'info' : 
                notifikasi.type === 'warning' ? 'warning' : 
                notifikasi.type === 'error' ? 'danger' : 
                notifikasi.type === 'success' ? 'success' : 'secondary'
              }>
                {notifikasi.type}
              </Badge>
            </td>
            <td className="py-4 px-6">{new Date(notifikasi.created_at).toLocaleString('id-ID')}</td>
            <td className="py-4 px-6">
              <Badge variant={notifikasi.is_read ? 'secondary' : 'warning'}>
                {notifikasi.is_read ? 'Dibaca' : 'Belum Dibaca'}
              </Badge>
            </td>
            <td className="py-4 px-6">
              {!notifikasi.is_read && (
                <Button 
                  onClick={() => markAsRead(notifikasi.id)}
                  variant="secondary" 
                  size="sm"
                >
                  Tandai Sudah Dibaca
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarNotifikasi;
