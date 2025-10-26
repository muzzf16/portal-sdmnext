import React from 'react';
import { useForm } from 'react-hook-form';
import { Cuti } from '../types';
import { ajukanPermintaanCuti } from '../api/cutiApi';

const FormCuti: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Cuti, 'id' | 'employeeName' | 'status'>>();

  const onSubmit = async (data: Omit<Cuti, 'id' | 'employeeName' | 'status'>) => {
    try {
      await ajukanPermintaanCuti(data);
      // Handle success
    } catch (error) {
      // Handle error
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
