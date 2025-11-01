import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Cuti } from '../types';
import { ajukanPermintaanCuti } from '../api/cutiApi';

import { useToast } from '@/app/providers/ToastContext';

// Define the form data type (excluding id, employeeName, status, employeeId which are set by the system)
type FormData = Omit<Cuti, 'id' | 'employeeName' | 'status' | 'employeeId'>;

const FormCuti: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const { user } = useAuth();
  const { addToast } = useToast();

  const onSubmit = async (data: FormData) => {
    if (!user) {
      addToast('Anda harus login untuk mengajukan cuti', 'error');
      return;
    }

    try {
      // Include the employee ID and name in the request
      const requestData = {
        ...data,
        employeeId: user.employeeId,
        employeeName: user.name,
      };
      
      await ajukanPermintaanCuti(requestData);
      addToast('Permintaan cuti berhasil dikirim', 'success');
      reset(); // Clear the form after successful submission
    } catch (error) {
      console.error('Error submitting leave request:', error);
      addToast('Gagal mengirim permintaan cuti', 'error');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-4">Ajukan Cuti</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Jenis Cuti</label>
          <select
            {...register('leaveType', { required: true })}
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
          >
            <option value="Annual">Tahunan</option>
            <option value="Sick">Sakit</option>
            <option value="Special">Khusus</option>
          </select>
          {errors.leaveType && <span className="text-red-500 text-sm">Kolom ini wajib diisi</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tanggal Mulai</label>
          <input
            type="date"
            {...register('startDate', { required: true })}
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
          />
          {errors.startDate && <span className="text-red-500 text-sm">Kolom ini wajib diisi</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tanggal Selesai</label>
          <input
            type="date"
            {...register('endDate', { required: true })}
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
          />
          {errors.endDate && <span className="text-red-500 text-sm">Kolom ini wajib diisi</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Alasan</label>
          <textarea
            {...register('reason')}
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-80"
        >
          Kirim Permintaan
        </button>
      </form>
    </div>
  );
};

export default FormCuti;
