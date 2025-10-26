import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Kinerja } from '../types';
import { buatPenilaianKinerja } from '../api/kinerjaApi';

const FormKinerja: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Kinerja, 'id' | 'overallScore' | 'status'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Omit<Kinerja, 'id' | 'overallScore' | 'status'>) => {
    setIsSubmitting(true);
    try {
      // For simplicity, overallScore and status are handled by backend or derived
      await buatPenilaianKinerja(data);
      alert('Penilaian kinerja berhasil dibuat!');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal membuat penilaian kinerja.');
      console.error('Error creating kinerja:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Buat Penilaian Kinerja Baru</h2>
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
            <label htmlFor="period" className="block text-sm font-medium text-slate-700 mb-1">Periode (YYYY-MM)</label>
            <input
              id="period"
              {...register('period', { required: 'Periode wajib diisi', pattern: { value: /^\d{4}-\d{2}$/, message: 'Format periode YYYY-MM tidak valid' } })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.period && <span className="text-red-500 text-sm">{errors.period.message}</span>}
          </div>
          <div>
            <label htmlFor="reviewerName" className="block text-sm font-medium text-slate-700 mb-1">Nama Penilai</label>
            <input
              id="reviewerName"
              {...register('reviewerName', { required: 'Nama penilai wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.reviewerName && <span className="text-red-500 text-sm">{errors.reviewerName.message}</span>}
          </div>
          <div>
            <label htmlFor="reviewDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Penilaian</label>
            <input
              id="reviewDate"
              type="date"
              {...register('reviewDate', { required: 'Tanggal penilaian wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.reviewDate && <span className="text-red-500 text-sm">{errors.reviewDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="strengths" className="block text-sm font-medium text-slate-700 mb-1">Kekuatan</label>
            <textarea
              id="strengths"
              {...register('strengths')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="areasForImprovement" className="block text-sm font-medium text-slate-700 mb-1">Area Peningkatan</label>
            <textarea
              id="areasForImprovement"
              {...register('areasForImprovement')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="employeeFeedback" className="block text-sm font-medium text-slate-700 mb-1">Umpan Balik Karyawan</label>
            <textarea
              id="employeeFeedback"
              {...register('employeeFeedback')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          {/* KPI input would be more complex, possibly a dynamic list of fields */}
          <div className="md:col-span-2">
            <p className="block text-sm font-medium text-slate-700 mb-1">KPIs (Key Performance Indicators)</p>
            <p className="text-sm text-slate-500">Implementasi input KPI yang lebih kompleks akan dilakukan secara terpisah.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
        </button>
      </form>
    </div>
  );
};

export default FormKinerja;