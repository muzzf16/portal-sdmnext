import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, DollarSign, CalendarDays, BarChart3, Bell, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'Manajemen Karyawan',
      description: 'Kelola informasi karyawan secara terpusat, terorganisir, dan aman.',
      icon: <Users className="w-6 h-6" />,
      color: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Absensi & Kehadiran',
      description: 'Catat dan lacak kehadiran karyawan secara real-time dengan akurasi tinggi.',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Payroll & Penggajian',
      description: 'Automatisasi perhitungan gaji, tunjangan, dan potongan secara akurat.',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Manajemen Cuti & Izin',
      description: 'Proses pengajuan cuti dengan sistem approval berjenjang yang transparan.',
      icon: <CalendarDays className="w-6 h-6" />,
      color: 'from-violet-500 to-violet-600',
    },
    {
      title: 'Penilaian Kinerja',
      description: 'Evaluasi kinerja karyawan dengan KPI terstruktur dan laporan analitik.',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Notifikasi & Pengingat',
      description: 'Sistem notifikasi otomatis untuk kontrak, cuti, dan event penting lainnya.',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-sky-500 to-sky-600',
    },
  ];

  const stats = [
    { label: 'Modul Terintegrasi', value: '10+' },
    { label: 'Proses Otomatis', value: '100%' },
    { label: 'Keamanan Data', value: 'Terjamin' },
    { label: 'Dukungan', value: '24/7' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Navigation ═══ */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-button">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">Portal<span className="text-primary-600">SDM</span></span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 shadow-button hover:shadow-button-hover transition-all duration-200 active:scale-[0.97]"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 ring-1 ring-inset ring-primary-600/10">
              <Zap className="w-4 h-4" />
              Platform HRMS Modern & Terintegrasi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight tracking-tight">
              Kelola Sumber Daya
              <br />
              <span className="text-gradient">Manusia dengan Mudah</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Solusi terpadu untuk mengelola karyawan, absensi, payroll, cuti, dan kinerja — dalam satu platform yang modern dan efisien.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-button hover:shadow-button-hover transition-all duration-200 active:scale-[0.97]"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-neutral-700 font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 active:scale-[0.97]"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="py-20 bg-neutral-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Fitur Lengkap untuk <span className="text-gradient">Manajemen SDM</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola sumber daya manusia secara modern dan efektif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-neutral-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-button mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why Us Section ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Mengapa memilih <span className="text-gradient">Portal SDM?</span>
              </h2>
              <p className="mt-4 text-lg text-neutral-500 leading-relaxed">
                Dibangun dengan teknologi modern untuk kebutuhan manajemen SDM yang semakin kompleks.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: <Shield className="w-5 h-5" />, title: 'Keamanan Terjamin', desc: 'Enkripsi data end-to-end dan autentikasi multi-layer.' },
                  { icon: <Zap className="w-5 h-5" />, title: 'Cepat & Efisien', desc: 'Performa tinggi dengan antarmuka yang responsif dan ringan.' },
                  { icon: <Globe className="w-5 h-5" />, title: 'Akses Dimana Saja', desc: 'Akses dari perangkat apapun — desktop, tablet, maupun mobile.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center ring-1 ring-inset ring-primary-600/10">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                      <p className="text-sm text-neutral-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abstract visual */}
            <div className="relative animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 border border-primary-200/30" />
                <div className="absolute inset-8 rounded-2xl bg-white shadow-elevated border border-neutral-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-elevated mb-6">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">Portal SDM</p>
                    <p className="text-sm text-neutral-400 mt-2">Human Resource Management System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fadeInUp">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Siap Meningkatkan Efisiensi HR Anda?
          </h2>
          <p className="text-lg text-primary-100 mt-4 max-w-2xl mx-auto">
            Bergabunglah dan mulai kelola manajemen SDM secara modern dan efisien.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 shadow-elevated transition-all duration-200 active:scale-[0.97]"
          >
            Dapatkan Akses Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-xl font-bold">Portal<span className="text-primary-400">SDM</span></span>
            </div>
            <p className="text-neutral-400 text-sm max-w-md">
              Sistem Manajemen Sumber Daya Manusia Modern & Terintegrasi
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</a>
            </div>
            <div className="divider-gradient w-full max-w-sm mt-8 mb-6" />
            <p className="text-neutral-500 text-xs">
              &copy; {new Date().getFullYear()} Bagian IT PT BPR BAPERA BATANG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;