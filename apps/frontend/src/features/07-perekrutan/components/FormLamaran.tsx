import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lamaran } from '../types';
import { buatLamaran } from '../api/perekrutanApi';

const FormLamaran: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Lamaran, 'id'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Omit<Lamaran, 'id'>) => {
    setIsSubmitting(true);
    try {
      await buatLamaran(data);
      alert('Lamaran berhasil dikirim!');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal mengirim lamaran.');
      console.error('Error creating lamaran:', error);
    }
    setIsSubmitting(false);
  };

  const applicationStatuses = ['Applied', 'Interviewing', 'Offered', 'Hired', 'Rejected'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Buat Lamaran Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              id="name"
              {...register('name', { required: 'Nama wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/, message: 'Format email tidak valid' } })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="positionApplied" className="block text-sm font-medium text-slate-700 mb-1">Posisi Dilamar</label>
            <input
              id="positionApplied"
              {...register('positionApplied', { required: 'Posisi dilamar wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.positionApplied && <span className="text-red-500 text-sm">{errors.positionApplied.message}</span>}
          </div>
          <div>
            <label htmlFor="applicationDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lamaran</label>
            <input
              id="applicationDate"
              type="date"
              {...register('applicationDate', { required: 'Tanggal lamaran wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.applicationDate && <span className="text-red-500 text-sm">{errors.applicationDate.message}</span>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status Lamaran</label>
            <select
              id="status"
              {...register('status', { required: 'Status lamaran wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Status</option>
              {applicationStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-slate-700 mb-1">URL Resume</label>
            <input
              id="resumeUrl"
              {...register('resumeUrl')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-700 mb-1">Surat Lamaran</label>
            <textarea
              id="coverLetter"
              {...register('coverLetter')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
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
          {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
        </button>
      </form>
    </div>
  );
};

export default FormLamaran;