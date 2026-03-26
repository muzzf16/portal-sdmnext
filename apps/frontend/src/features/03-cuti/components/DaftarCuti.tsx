import React from 'react';
import { useCuti } from '../hooks/useCuti';
import { normalizeLeaveStatusLabel, useUpdateLeaveRequestStatus } from '../hooks/useLeaveQuery';
import { Table, Badge, Button } from '@/shared/components/ui';

import { useToast } from '@/app/providers/ToastContext';

const DaftarCuti: React.FC = () => {
  const { cuti, loading, error } = useCuti();
  const updateStatusMutation = useUpdateLeaveRequestStatus();
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
        await updateStatusMutation.mutateAsync({
          id,
          status: status as 'disetujui' | 'ditolak',
          rejectionReason: reason
        });
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
        {cuti.map(l => {
          const statusMeta = normalizeLeaveStatusLabel(l.status);

          return (
            <tr key={l.id}>
            <td className="py-4 px-6">{l.employeeName}</td>
            <td className="py-4 px-6">{l.leaveType}</td>
            <td className="py-4 px-6">{l.startDate}</td>
            <td className="py-4 px-6">{l.endDate}</td>
            <td className="py-4 px-6">
              <Badge variant={statusMeta.badge}>
                {statusMeta.label}
              </Badge>
            </td>
            <td className="py-4 px-6">
              {statusMeta.value === 'menunggu' && (
                <div className="flex space-x-2">
                  <Button 
                    variant="success" 
                    size="sm"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleUpdateStatus(l.id, 'disetujui')}
                  >
                    Setujui
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    disabled={updateStatusMutation.isPending}
                    onClick={() => handleUpdateStatus(l.id, 'ditolak')}
                  >
                    Tolak
                  </Button>
                </div>
              )}
            </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default DaftarCuti;
