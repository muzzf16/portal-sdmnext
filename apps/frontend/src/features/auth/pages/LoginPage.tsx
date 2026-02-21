import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCompanySettings } from '@/shared/contexts/CompanySettingsContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { settings } = useCompanySettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/employee');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Login gagal. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══ Left Panel — Branding ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
            {/* Grid pattern */}
            <svg className="w-full h-full opacity-[0.03]" viewBox="0 0 400 400">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-3 mb-10">
              {settings?.logo ? (
                <img
                  className="h-10 w-10 rounded-xl object-contain ring-1 ring-white/20"
                  src={settings.logo}
                  alt={settings.companyName || 'Logo'}
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                  <span className="text-white text-lg font-bold">P</span>
                </div>
              )}
              <span className="text-white/90 text-xl font-bold">
                {settings?.companyName || 'Portal SDM'}
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Selamat Datang
              <br />
              <span className="text-primary-200">di Portal SDM</span>
            </h1>

            <p className="mt-6 text-lg text-primary-200/80 max-w-md leading-relaxed">
              Sistem Manajemen Sumber Daya Manusia yang modern, terintegrasi, dan mudah digunakan.
            </p>

            {settings?.address && (
              <p className="mt-8 text-sm text-primary-300/50">
                {settings.address}
              </p>
            )}

            {/* Feature pills */}
            <div className="mt-10 flex flex-wrap gap-3">
              {['Absensi', 'Penggajian', 'Kinerja', 'Cuti'].map((item) => (
                <span key={item} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.08] text-white/70 text-sm font-medium backdrop-blur-sm ring-1 ring-white/[0.06]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right Panel — Login Form ═══ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-50 px-6 py-12">
        <div className="w-full max-w-md animate-fadeInUp">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            {settings?.logo ? (
              <img className="h-10 w-10 rounded-xl object-contain" src={settings.logo} alt="Logo" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white text-lg font-bold">P</span>
              </div>
            )}
            <span className="text-xl font-bold text-neutral-900">
              {settings?.companyName || 'Portal SDM'}
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Masuk ke akun Anda
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Masukkan email dan kata sandi untuk melanjutkan
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  placeholder="nama@perusahaan.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-md border-neutral-300 text-primary-600 focus:ring-primary-500/20 transition"
                />
                <span className="text-sm text-neutral-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-button hover:shadow-button-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-neutral-500">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Daftar di sini
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-12 text-center text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {settings?.companyName || 'Portal SDM'}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;