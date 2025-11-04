import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Cuti } from '../types';
import { ajukanPermintaanCuti } from '../api/cutiApi';
import { useToast } from '@/app/providers/ToastContext';

// Correctly type the form data based on the Cuti type
type CutiFormData = Pick<Cuti, 'leaveType' | 'startDate' | 'endDate' | 'reason'>;

const FormCuti: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CutiFormData>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);

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
      await ajukanPermintaanCuti(formData);
      addToast('Permintaan cuti berhasil dikirim', 'success');
      reset();
      setFile(null);
      // Also reset the file input visually
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error submitting leave request:', error);
      addToast('Gagal mengirim permintaan cuti', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Ajukan Cuti</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Cuti</label>
          <select
            id="leaveType"
            {...register('leaveType', { required: 'Jenis cuti wajib diisi' })}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="Annual">Tahunan</option>
            <option value="Sick">Sakit</option>
            <option value="Special">Khusus</option>
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
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.startDate && <span className="text-red-500 text-sm mt-1">{errors.startDate.message}</span>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
            <input
              id="endDate"
              type="date"
              {...register('endDate', { required: 'Tanggal selesai wajib diisi' })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {errors.endDate && <span className="text-red-500 text-sm mt-1">{errors.endDate.message}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alasan</label>
          <textarea
            id="reason"
            rows={4}
            {...register('reason')}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dokumen Pendukung (Surat Izin/SKD)</label>
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
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-neutral-600"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCuti;
