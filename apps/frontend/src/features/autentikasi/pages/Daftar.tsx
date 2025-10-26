import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerApi } from '../../../shared/services/authAPI'; // Alias to avoid conflict with useForm's register

const Daftar: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await registerApi(data);
      alert('Registrasi berhasil! Silakan masuk.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
      console.error('Registration error:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-primary-dark-blue">Daftar</h1>
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Nama wajib diisi' })}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Kata Sandi</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Kata sandi wajib diisi', minLength: { value: 6, message: 'Kata sandi minimal 6 karakter' } })}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-80 disabled:bg-slate-400 transition-colors duration-200"
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-primary-dark-blue hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Daftar;
