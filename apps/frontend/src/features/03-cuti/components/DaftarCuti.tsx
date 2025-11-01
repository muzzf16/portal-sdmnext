import React from 'react';
import { useCuti } from '../hooks/useCuti';
import { perbaruiStatusPermintaanCuti } from '../api/cutiApi';
import { Table, Badge, Button } from '@/shared/components/ui';

import { useToast } from '@/app/providers/ToastContext';

const DaftarCuti: React.FC = () => {
  const { cuti, loading, error, setCuti } = useCuti();
  const { addToast } = useToast();

  const handleUpdateStatus = async (id: string, status: string) => {
    let reason: string | undefined;
    if (status === 'ditolak') {
        const inputReason = prompt('Masukkan alasan penolakan:');
        if (inputReason === null) return; // User cancelled the prompt
        reason = inputReason;
    }

    const confirmAction = status === 'disetujui' ? 'approve' : 'reject';

    if (window.confirm(`Apakah Anda yakin ingin ${confirmAction === 'approve' ? 'menyetujui' : 'menolak'} permohonan cuti ini?`)) {
      try {
        await perbaruiStatusPermintaanCuti(id, status, reason);
        // Optimistically update the UI
        setCuti(cuti.map(l => l.id === id ? { ...l, status } : l));
        addToast(`Permintaan cuti berhasil di ${status === 'disetujui' ? 'setujui' : 'tolak'}.`, 'success');
      } catch (error) {
        console.error("Gagal memperbarui status cuti", error);
        addToast(`Gagal ${confirmAction} permohonan cuti.`, 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Jenis Cuti', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Aksi'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {cuti.map(l => (
          <tr key={l.id}>
            <td className="py-4 px-6">{l.employeeName}</td>
            <td className="py-4 px-6">{l.leaveType}</td>
            <td className="py-4 px-6">{l.startDate}</td>
            <td className="py-4 px-6">{l.endDate}</td>
            <td className="py-4 px-6">
              <Badge 
                variant={
                  l.status === 'disetujui' ? 'success' : 
                  l.status === 'ditolak' ? 'danger' : 'warning'
                }
              >
                {l.status}
              </Badge>
            </td>
            <td className="py-4 px-6">
              {l.status === 'menunggu' && (
                <div className="flex space-x-2">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => handleUpdateStatus(l.id, 'disetujui')}
                  >
                    Setujui
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleUpdateStatus(l.id, 'ditolak')}
                  >
                    Tolak
                  </Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default DaftarCuti;
