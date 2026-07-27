import React, { useState, useMemo } from 'react';
import { useCuti } from '../hooks/useCuti';
import { normalizeLeaveStatusLabel, useUpdateLeaveRequestStatus, useDeleteLeaveRequest } from '../hooks/useLeaveQuery';
import { Table, Badge, Button, Modal } from '@/shared/components/ui';
import { useToast } from '@/app/providers/ToastContext';
import { Search, Filter, Edit2, Trash2 } from 'lucide-react';
import type { Cuti } from '../types';

type ActionType = 'disetujui' | 'ditolak';

interface PendingAction {
  leaveRequest: Cuti;
  action: ActionType;
}

interface DaftarCutiProps {
  onEdit?: (item: Cuti) => void;
}

const DaftarCuti: React.FC<DaftarCutiProps> = ({ onEdit }) => {
  const { cuti, loading, error } = useCuti();
  const updateStatusMutation = useUpdateLeaveRequestStatus();
  const deleteMutation = useDeleteLeaveRequest();
  const { addToast } = useToast();

  // Filter & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  // Modal state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredCuti = useMemo(() => {
    let result = cuti;

    if (statusFilter !== 'semua') {
      result = result.filter((l) => normalizeLeaveStatusLabel(l.status).value === statusFilter);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(lower) ||
          l.leaveType.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [cuti, statusFilter, searchTerm]);

  const openConfirmModal = (leaveRequest: Cuti, action: ActionType) => {
    setPendingAction({ leaveRequest, action });
    setRejectionReason('');
  };

  const closeModal = () => {
    setPendingAction(null);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const { leaveRequest, action } = pendingAction;

    try {
      await updateStatusMutation.mutateAsync({
        id: leaveRequest.id,
        status: action,
        rejectionReason: action === 'ditolak' ? rejectionReason : undefined
      });
      addToast(
        `Permintaan cuti ${leaveRequest.employeeName} berhasil ${action === 'disetujui' ? 'disetujui' : 'ditolak'}.`,
        'success'
      );
      closeModal();
    } catch (err) {
      console.error('Gagal memperbarui status cuti', err);
      addToast(`Gagal memperbarui status cuti.`, 'error');
    }
  };

  const handleDelete = async (item: Cuti) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data permohonan cuti atas nama ${item.employeeName}?`)) {
      try {
        await deleteMutation.mutateAsync(item.id);
        addToast(`Permohonan cuti ${item.employeeName} berhasil dihapus`, 'success');
      } catch (err) {
        console.error('Gagal menghapus permohonan cuti', err);
        addToast('Gagal menghapus permohonan cuti', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Jenis Cuti', 'Tanggal Mulai', 'Tanggal Selesai', 'Jumlah Hari', 'Status', 'Aksi'];

  return (
    <div className="mt-6">
      {/* Header Title */}
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Daftar Pegawai yang Cuti</h2>

      {/* Toolbar: Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama pegawai atau jenis cuti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 dark:text-white w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
          >
            <option value="semua">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {filteredCuti.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm || statusFilter !== 'semua'
            ? 'Tidak ada data yang cocok dengan filter.'
            : 'Belum ada pengajuan cuti.'}
        </div>
      ) : (
        <Table headers={tableHeaders}>
          {filteredCuti.map((l) => {
            const statusMeta = normalizeLeaveStatusLabel(l.status);

            return (
              <tr key={l.id}>
                <td className="py-4 px-6 font-medium">{l.employeeName}</td>
                <td className="py-4 px-6">{l.leaveType}</td>
                <td className="py-4 px-6">{l.startDate}</td>
                <td className="py-4 px-6">{l.endDate}</td>
                <td className="py-4 px-6">{l.jumlahHari ?? '-'}</td>
                <td className="py-4 px-6">
                  <Badge variant={statusMeta.badge}>
                    {statusMeta.label}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {statusMeta.value === 'menunggu' && (
                      <div className="flex space-x-1">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => openConfirmModal(l, 'disetujui')}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => openConfirmModal(l, 'ditolak')}
                        >
                          Tolak
                        </Button>
                      </div>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(l)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        title="Edit Cuti"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(l)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      title="Hapus Cuti"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <Modal
          isOpen={!!pendingAction}
          onClose={closeModal}
          title={pendingAction.action === 'disetujui' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Nama:</span>
                <span className="font-medium">{pendingAction.leaveRequest.employeeName}</span>
                <span className="text-gray-500 dark:text-gray-400">Jenis Cuti:</span>
                <span>{pendingAction.leaveRequest.leaveType}</span>
                <span className="text-gray-500 dark:text-gray-400">Tanggal:</span>
                <span>{pendingAction.leaveRequest.startDate} — {pendingAction.leaveRequest.endDate}</span>
                {pendingAction.leaveRequest.reason && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">Alasan:</span>
                    <span>{pendingAction.leaveRequest.reason}</span>
                  </>
                )}
              </div>
            </div>

            {pendingAction.action === 'disetujui' ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin <strong className="text-emerald-600">menyetujui</strong> permohonan cuti ini?
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Apakah Anda yakin ingin <strong className="text-red-600">menolak</strong> permohonan cuti ini?
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alasan Penolakan
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Masukkan alasan penolakan..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={pendingAction.action === 'disetujui' ? 'success' : 'danger'}
                loading={updateStatusMutation.isPending}
                onClick={handleConfirmAction}
              >
                {pendingAction.action === 'disetujui' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DaftarCuti;
