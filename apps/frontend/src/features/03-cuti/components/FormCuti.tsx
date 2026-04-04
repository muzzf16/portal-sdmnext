import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Cuti } from '../types';
import { useSubmitLeaveRequest, useLeaveBalance } from '../hooks/useLeaveQuery';
import { useToast } from '@/app/providers/ToastContext';
import { Badge } from '@/shared/components/ui';
import { CalendarDays, FileText, Info } from 'lucide-react';

type CutiFormData = Pick<Cuti, 'leaveType' | 'startDate' | 'endDate' | 'reason'>;

const FormCuti: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<CutiFormData>({
    defaultValues: {
      leaveType: ''
    }
  });
  const { user } = useAuth();
  const { addToast } = useToast();
  const submitLeaveRequest = useSubmitLeaveRequest();
  const [file, setFile] = useState<File | null>(null);

  const employeeId = user?.employeeId ? String(user.employeeId) : undefined;
  const { data: leaveBalance, isLoading: balanceLoading } = useLeaveBalance(employeeId);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate jumlah hari preview
  const jumlahHariPreview = (() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  })();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const onSubmit = async (data: CutiFormData) => {
    if (!user) {
      addToast('Anda harus login untuk mengajukan cuti', 'error');
      return;
    }

    if (!user.employeeId) {
      addToast('Employee ID tidak ditemukan', 'error');
      return;
    }

    // Validate date range
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      addToast('Tanggal selesai tidak boleh lebih awal dari tanggal mulai', 'error');
      return;
    }

    // Check leave balance for annual leave
    if (data.leaveType === 'Tahunan' && leaveBalance && jumlahHariPreview !== null) {
      if (jumlahHariPreview > leaveBalance.sisaCuti) {
        addToast(
          `Sisa cuti Anda (${leaveBalance.sisaCuti} hari) tidak mencukupi untuk pengajuan ${jumlahHariPreview} hari.`,
          'error'
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append('leaveType', data.leaveType);
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    formData.append('reason', data.reason || '');
    formData.append('employeeId', user.employeeId);
    formData.append('employeeName', user.name);
    if (file) {
      formData.append('supportingDocument', file);
    }

    try {
      await submitLeaveRequest.mutateAsync(formData);
      addToast('Permintaan cuti berhasil dikirim', 'success');
      reset();
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting leave request:', error);
      addToast('Gagal mengirim permintaan cuti', 'error');
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mt-8">
      {/* Leave Balance Card */}
      {leaveBalance && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">Jatah Cuti</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{leaveBalance.jatahCuti}</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <p className="text-xs text-orange-600 dark:text-orange-400">Diambil</p>
            <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{leaveBalance.cutiDiambil}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
            <p className="text-xs text-amber-600 dark:text-amber-400">Cuti Bersama</p>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{leaveBalance.cutiBersama}</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${leaveBalance.sisaCuti < 5 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
            <p className={`text-xs ${leaveBalance.sisaCuti < 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>Sisa Cuti</p>
            <p className={`text-lg font-bold ${leaveBalance.sisaCuti < 5 ? 'text-red-800 dark:text-red-200' : 'text-emerald-800 dark:text-emerald-200'}`}>{leaveBalance.sisaCuti}</p>
          </div>
        </div>
      )}

      {balanceLoading && (
        <div className="mb-6 grid grid-cols-4 gap-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 bg-gray-100 dark:bg-neutral-700 rounded-lg h-16" />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <CalendarDays size={24} />
        Ajukan Cuti
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Cuti</label>
          <select
            id="leaveType"
            {...register('leaveType', { required: 'Jenis cuti wajib dipilih' })}
            className={inputClass}
          >
            <option value="" disabled>— Pilih Jenis Cuti —</option>
            <option value="Tahunan">Tahunan</option>
            <option value="Sakit">Sakit</option>
            <option value="Khusus">Khusus</option>
          </select>
          {errors.leaveType && <span className="text-red-500 text-sm mt-1">{errors.leaveType.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
            <input
              id="startDate"
              type="date"
              {...register('startDate', { required: 'Tanggal mulai wajib diisi' })}
              className={inputClass}
            />
            {errors.startDate && <span className="text-red-500 text-sm mt-1">{errors.startDate.message}</span>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
            <input
              id="endDate"
              type="date"
              {...register('endDate', {
                required: 'Tanggal selesai wajib diisi',
                validate: (value) => {
                  if (startDate && value < startDate) {
                    return 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai';
                  }
                  return true;
                }
              })}
              min={startDate || undefined}
              className={inputClass}
            />
            {errors.endDate && <span className="text-red-500 text-sm mt-1">{errors.endDate.message}</span>}
          </div>
        </div>

        {/* Days preview */}
        {jumlahHariPreview !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Info size={14} className="text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Durasi cuti: <strong className="text-gray-900 dark:text-white">{jumlahHariPreview} hari</strong>
            </span>
            {watch('leaveType') === 'Tahunan' && leaveBalance && jumlahHariPreview > leaveBalance.sisaCuti && (
              <Badge variant="danger">Melebihi sisa cuti!</Badge>
            )}
          </div>
        )}

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alasan</label>
          <textarea
            id="reason"
            rows={4}
            {...register('reason')}
            placeholder="Berikan alasan pengajuan cuti..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <FileText size={14} />
            Dokumen Pendukung (Surat Izin/SKD)
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300 dark:hover:file:bg-primary-900/50"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || submitLeaveRequest.isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-neutral-600"
          >
            {isSubmitting || submitLeaveRequest.isPending ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCuti;
