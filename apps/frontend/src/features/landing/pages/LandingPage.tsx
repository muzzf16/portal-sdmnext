import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">Portal-SDM</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                to="/login" 
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Sistem Manajemen <span className="text-indigo-600">Sumber Daya Manusia</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Solusi terpadu untuk mengelola karyawan, absensi, payroll, cuti, dan kinerja dengan pendekatan modern dan efisien.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/login" 
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
          >
            Mulai Sekarang
          </Link>
          <Link 
            to="/login" 
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition duration-300"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Fitur Lengkap untuk Manajemen SDM</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Platform kami menyediakan semua yang Anda butuhkan untuk mengelola sumber daya manusia secara efektif.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Manajemen Karyawan",
                description: "Kelola informasi karyawan secara terpusat dan terorganisir",
                icon: "👥"
              },
              {
                title: "Absensi & Kehadiran",
                description: "Catat dan lacak kehadiran karyawan dengan cepat dan akurat",
                icon: "⏰"
              },
              {
                title: "Payroll & Penggajian",
                description: "Automatisasi perhitungan gaji dan slip gaji",
                icon: "💰"
              },
              {
                title: "Manajemen Cuti & Izin",
                description: "Proses pengajuan cuti dengan sistem approval yang jelas",
                icon: "🗓️"
              },
              {
                title: "Penilaian Kinerja",
                description: "Evaluasi kinerja karyawan secara objektif dan terstruktur",
                icon: "📊"
              },
              {
                title: "Notifikasi & Pengingat",
                description: "Sistem notifikasi otomatis untuk berbagai keperluan",
                icon: "🔔"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Siap Meningkatkan Efisiensi HR Anda?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan organisasi yang telah meningkatkan manajemen SDM mereka.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition duration-300"
          >
            Dapatkan Akses Gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Portal-SDM</h3>
            <p className="text-gray-400">Sistem Manajemen Sumber Daya Manusia Modern</p>
            <div className="mt-6 flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
            <p className="mt-8 text-gray-400">&copy; 2025 bagianIT PT BPR BAPERA BATANG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;