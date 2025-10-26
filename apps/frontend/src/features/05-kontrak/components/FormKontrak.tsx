import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Kontrak } from '../types';
import { buatKontrak } from '../api/kontrakApi';

const FormKontrak: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Kontrak, 'id'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Omit<Kontrak, 'id'>) => {
    setIsSubmitting(true);
    try {
      await buatKontrak(data);
      alert('Kontrak berhasil dibuat!');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal membuat kontrak.');
      console.error('Error creating kontrak:', error);
    }
    setIsSubmitting(false);
  };

  const contractTypes = ['permanent', 'temporary', 'contract'];
  const contractStatuses = ['active', 'expiring', 'expired', 'terminated'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Buat Kontrak Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">ID Pegawai</label>
            <input
              id="employeeId"
              {...register('employeeId', { required: 'ID Pegawai wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.employeeId && <span className="text-red-500 text-sm">{errors.employeeId.message}</span>}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">Posisi</label>
            <input
              id="position"
              {...register('position', { required: 'Posisi wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.position && <span className="text-red-500 text-sm">{errors.position.message}</span>}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <input
              id="department"
              {...register('department', { required: 'Departemen wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.department && <span className="text-red-500 text-sm">{errors.department.message}</span>}
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
            <input
              id="startDate"
              type="date"
              {...register('startDate', { required: 'Tanggal mulai wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.startDate && <span className="text-red-500 text-sm">{errors.startDate.message}</span>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Berakhir</label>
            <input
              id="endDate"
              type="date"
              {...register('endDate', { required: 'Tanggal berakhir wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.endDate && <span className="text-red-500 text-sm">{errors.endDate.message}</span>}
          </div>
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-slate-700 mb-1">Jenis Kontrak</label>
            <select
              id="contractType"
              {...register('contractType', { required: 'Jenis kontrak wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Jenis Kontrak</option>
              {contractTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.contractType && <span className="text-red-500 text-sm">{errors.contractType.message}</span>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status Kontrak</label>
            <select
              id="status"
              {...register('status', { required: 'Status kontrak wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Status</option>
              {contractStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="documentUrl" className="block text-sm font-medium text-slate-700 mb-1">URL Dokumen</label>
            <input
              id="documentUrl"
              {...register('documentUrl')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Kontrak'}
        </button>
      </form>
    </div>
  );
};

export default FormKontrak;