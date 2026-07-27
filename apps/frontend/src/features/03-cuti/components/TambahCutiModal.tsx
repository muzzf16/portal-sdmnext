import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePegawaiList } from '@/features/01-pegawai/hooks/usePegawaiList';
import { useLeaveBalance, useSubmitLeaveRequest, useUpdateLeaveRequest } from '../hooks/useLeaveQuery';
import { useToast } from '@/app/providers/ToastContext';
import { CalendarDays, FileText, Info, X } from 'lucide-react';
import type { Cuti } from '../types';

interface TambahCutiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingItem?: Cuti | null;
}

export const TambahCutiModal: React.FC<TambahCutiModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem = null,
}) => {
  const { user } = useAuth();
  const { pegawai = [] } = usePegawaiList();
  const { addToast } = useToast();
  const submitLeaveRequest = useSubmitLeaveRequest();
  const updateLeaveRequest = useUpdateLeaveRequest();

  const [employeeId, setEmployeeId] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set default selected employee or populate editing item when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setEmployeeId(String(editingItem.employeeId || ''));
        setLeaveType(editingItem.leaveType || '');
        setStartDate(editingItem.startDate ? editingItem.startDate.substring(0, 10) : '');
        setEndDate(editingItem.endDate ? editingItem.endDate.substring(0, 10) : '');
        setReason(editingItem.reason || '');
      } else {
        if (user?.employeeId) {
          setEmployeeId(String(user.employeeId));
        } else if (pegawai.length > 0) {
          setEmployeeId(String(pegawai[0].id));
        }
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
      }
      setFile(null);
      setError(null);
    }
  }, [isOpen, user, pegawai, editingItem]);

  // Fetch leave balance for selected employee
  const { data: leaveBalance, isLoading: balanceLoading } = useLeaveBalance(employeeId || undefined);

  // Calculate jumlah hari preview
  const jumlahHariPreview = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError('Silakan pilih pegawai terlebih dahulu');
      return;
    }

    if (!leaveType) {
      setError('Silakan pilih jenis cuti');
      return;
    }

    if (!startDate || !endDate) {
      setError('Tanggal mulai dan tanggal selesai wajib diisi');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    // Check balance for annual leave or sick leave without SKD
    const isAnnualDeduction = leaveType === 'Tahunan' || (leaveType === 'Sakit' && !file && !editingItem?.supportingDocument);
    if (isAnnualDeduction && leaveBalance && jumlahHariPreview !== null && !editingItem) {
      if (jumlahHariPreview > leaveBalance.sisaCuti) {
        setError(
          `Sisa cuti pegawai (${leaveBalance.sisaCuti} hari) tidak mencukupi untuk pengajuan ${jumlahHariPreview} hari (Cuti ${leaveType} tanpa SKD memotong jatah cuti).`
        );
        return;
      }
    }

    // Find selected employee name
    const selectedPegawai = pegawai.find((p) => String(p.id) === String(employeeId));
    const employeeName = selectedPegawai?.name || user?.name || 'Pegawai';

    const formData = new FormData();
    formData.append('employeeId', employeeId);
    formData.append('employeeName', employeeName);
    formData.append('leaveType', leaveType);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('reason', reason);
    if (file) {
      formData.append('supportingDocument', file);
    }

    try {
      if (editingItem && editingItem.id) {
        await updateLeaveRequest.mutateAsync({ id: editingItem.id, payload: formData });
        addToast('Data permohonan cuti berhasil diperbarui', 'success');
      } else {
        await submitLeaveRequest.mutateAsync(formData);
        addToast('Permintaan cuti berhasil dikirim', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving leave request:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan data permohonan cuti';
      setError(msg);
    }
  };

  const isPending = submitLeaveRequest.isPending || updateLeaveRequest.isPending;

  const inputClass =
    'w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {editingItem ? 'Edit Permohonan Cuti' : 'Input Cuti Karyawan'}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Leave Balance Preview Cards */}
          {leaveBalance ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Jatah Cuti</p>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">{leaveBalance.jatahCuti} Hari</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Cuti Diambil</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">{leaveBalance.cutiDiambil} Hari</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Cuti Bersama</p>
                <p className="text-base font-bold text-purple-600 dark:text-purple-400">{leaveBalance.cutiBersama} Hari</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Sisa Cuti</p>
                <p className={`text-base font-bold ${leaveBalance.sisaCuti < 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {leaveBalance.sisaCuti} Hari
                </p>
              </div>
            </div>
          ) : balanceLoading ? (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg animate-pulse text-xs text-center text-neutral-500">
              Memuat saldo cuti...
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Selector */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nama Pegawai *
              </label>
              <select
                required
                className={inputClass}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">-- Pilih Pegawai --</option>
                {pegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.position ? `(${p.position})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type Selector */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Jenis Cuti *
              </label>
              <select
                required
                className={inputClass}
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="" disabled>-- Pilih Jenis Cuti --</option>
                <option value="Tahunan">Tahunan</option>
                <option value="Sakit">Sakit</option>
                <option value="Khusus">Khusus</option>
                <option value="Izin">Izin / Keperluan Penting</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                className={inputClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                min={startDate || undefined}
                className={inputClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Duration Preview */}
          {jumlahHariPreview !== null && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-800 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Durasi cuti: <strong>{jumlahHariPreview} hari</strong>
              </span>
              {((leaveType === 'Tahunan') || (leaveType === 'Sakit' && !file && !editingItem?.supportingDocument)) &&
                leaveBalance && jumlahHariPreview > leaveBalance.sisaCuti && !editingItem && (
                <Badge variant="danger" className="ml-auto">
                  Melebihi sisa cuti!
                </Badge>
              )}
            </div>
          )}

          {/* Warning for Sick Leave without SKD */}
          {leaveType === 'Sakit' && !file && !editingItem?.supportingDocument && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-md text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Aturan Cuti:</strong> Pengajuan Cuti Sakit tanpa unggah SKD (Surat Keterangan Dokter) akan <u>memotong sisa cuti tahunan</u> pegawai.
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Alasan Pengajuan Cuti
            </label>
            <textarea
              rows={3}
              placeholder="Masukkan alasan permohonan cuti..."
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Supporting Document */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <FileText className="w-4 h-4 text-neutral-500" />
              Dokumen Pendukung (Surat Dokter / SKD / Surat Izin)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="w-full text-xs text-neutral-500 border border-neutral-300 dark:border-neutral-600 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
            />
            {editingItem?.supportingDocument && !file && (
              <p className="text-xs text-neutral-500 mt-1">Berkas saat ini: {editingItem.supportingDocument}</p>
            )}
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium">
              {error}
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" loading={isPending}>
              {editingItem ? 'Simpan Perubahan' : 'Simpan & Ajukan Cuti'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahCutiModal;
