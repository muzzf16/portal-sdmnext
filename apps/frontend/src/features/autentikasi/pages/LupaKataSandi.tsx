import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../../shared/services/authAPI';

const LupaKataSandi: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await forgotPassword(data.email);
      setMessage('Tautan reset kata sandi telah dikirim ke email Anda.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim tautan reset kata sandi.');
      console.error('Forgot password error:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-primary-dark-blue">Lupa Kata Sandi</h1>
        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.email && <span className="text-red-500 text-sm">{String(errors.email.message)}</span>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-80 disabled:bg-slate-400 transition-colors duration-200"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset Kata Sandi'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-slate-600">
          Ingat kata sandi Anda?{' '}
          <Link to="/login" className="font-medium text-primary-dark-blue hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LupaKataSandi;
