// src/features/01-pegawai/pages/HalamanDetailPegawai.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePegawai } from '../hooks/usePegawai';
import { useRiwayatJabatan } from '../hooks/useRiwayatJabatan';
import { usePelatihan } from '../hooks/usePelatihan';
import { printEmployeeProfile } from '../utils/printProfile';
import { ArrowLeft, User, Building, Award, FileText, Printer, Calendar, MapPin, Phone, Mail, Briefcase, GraduationCap, FileBadge, Star } from 'lucide-react';
import clsx from 'clsx';

const HalamanDetailPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // If there's no ID, show an error message
  if (!id) {
    return <div>ID pegawai tidak ditemukan</div>;
  }
  
  const { pegawai, loading, error } = usePegawai(id);
  const { riwayatJabatan, loading: loadingRiwayat, error: errorRiwayat } = useRiwayatJabatan(id);
  const { pelatihan, loading: loadingPelatihan, error: errorPelatihan } = usePelatihan(id);
  const [activeTab, setActiveTab] = useState('biodata');

  if (loading) return <div className="text-center py-8">Memuat...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>;
  if (!pegawai) return <div className="text-center py-8">Pegawai tidak ditemukan</div>;

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} tahun`;
  };



  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/dashboard/pegawai" 
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Pegawai
        </Link>
      </div>

      {/* Employee Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row">
            {/* Profile Picture */}
            <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
              {pegawai.avatarUrl ? (
                <img 
                  src={pegawai.avatarUrl} 
                  alt={pegawai.name} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-neutral-700 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-4 border-white dark:border-neutral-700 shadow-lg">
                  <span className="text-5xl font-bold text-primary-700 dark:text-primary-400">
                    {pegawai.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Employee Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{pegawai.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{pegawai.position}</p>
                  
                  <div className="flex items-center mt-3">
                    {pegawai.isActive === false ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                        <FileText className="h-4 w-4 mr-1" />
                        Nonaktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        <FileText className="h-4 w-4 mr-1" />
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Print Button */}
                <button 
                  onClick={() => printEmployeeProfile(pegawai)}
                  className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Profil PDF
                </button>
              </div>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="h-5 w-5 mr-3 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span className="truncate">{pegawai.email || '-'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>{pegawai.phone || '-'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span className="truncate">{pegawai.address || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 dark:border-neutral-700">
          <nav className="flex overflow-x-auto -mb-px">
            {[
              { id: 'biodata', label: 'Data Diri', icon: User },
              { id: 'riwayat', label: 'Riwayat Pekerjaan', icon: Briefcase },
              { id: 'sertifikat', label: 'Sertifikat', icon: FileBadge },
              { id: 'kinerja', label: 'Kinerja', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-neutral-600'
                )}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Biodata Tab */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Informasi Pribadi
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">{pegawai.name}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">NIK</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">{pegawai.nip || '-'}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Tempat, Tanggal Lahir</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.pob && pegawai.dob 
                        ? `${pegawai.pob}, ${new Date(pegawai.dob).toLocaleDateString('id-ID')}` 
                        : '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Umur</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.dob ? calculateAge(pegawai.dob) : '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Jenis Kelamin</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.jenis_kelamin === 'L' ? 'Laki-laki' : 
                       pegawai.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Agama</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.religion || '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Status Perkawinan</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.maritalStatus || '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Jumlah Anak</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.numberOfChildren || '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Informasi Kepegawaian
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Unit Kerja</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.department || '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Posisi</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.position || '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Tanggal Bergabung</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.joinDate 
                        ? new Date(pegawai.joinDate).toLocaleDateString('id-ID') 
                        : '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Masa Kerja</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.joinDate 
                        ? `${Math.floor((new Date().getTime() - new Date(pegawai.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} tahun`
                        : '-'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Status Kepegawaian</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.isActive !== false ? 'Aktif' : 'Nonaktif'}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500 dark:text-gray-400">Sisa Cuti</div>
                    <div className="w-2/3 text-sm font-medium text-gray-900 dark:text-white">
                      {pegawai.leaveBalance || '0'} hari
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat Pekerjaan Tab */}
          {activeTab === 'riwayat' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Riwayat Jabatan
              </h3>
              
              {loadingRiwayat ? (
                <div className="text-center py-4">Memuat riwayat jabatan...</div>
              ) : errorRiwayat ? (
                <div className="text-center py-4 text-red-500">Error: {errorRiwayat.message}</div>
              ) : riwayatJabatan && riwayatJabatan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jabatan Lama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jabatan Baru</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal Perubahan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Kerja</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                      {riwayatJabatan.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.jabatan_lama || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.jabatan_baru || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.tanggal_perubahan 
                              ? new Date(item.tanggal_perubahan).toLocaleDateString('id-ID') 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="mt-2">Tidak ada riwayat jabatan tersedia</p>
                </div>
              )}
            </div>
          )}

          {/* Sertifikat Tab */}
          {activeTab === 'sertifikat' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileBadge className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Riwayat Pelatihan & Sertifikat
              </h3>
              
              {loadingPelatihan ? (
                <div className="text-center py-4">Memuat pelatihan...</div>
              ) : errorPelatihan ? (
                <div className="text-center py-4 text-red-500">Error: {errorPelatihan.message}</div>
              ) : pelatihan && pelatihan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pelatihan.map((item: any) => (
                    <div 
                      key={item.id} 
                      className="border border-gray-200 dark:border-neutral-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Award className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{item.nama_pelatihan || item.trainingName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.penyelenggara || item.organizer}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                              <Calendar className="h-3 w-3 mr-1" />
                              {item.tanggal_mulai || item.startDate
                                ? new Date(item.tanggal_mulai || item.startDate).toLocaleDateString('id-ID') 
                                : '-'}
                            </span>
                            
                            {(item.nomor_sertifikat || item.certificate) && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                <FileText className="h-3 w-3 mr-1" />
                                {item.nomor_sertifikat || item.certificate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="mt-2">Tidak ada pelatihan atau sertifikat tersedia</p>
                </div>
              )}
            </div>
          )}

          {/* Kinerja Tab */}
          {activeTab === 'kinerja' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Evaluasi Kinerja
              </h3>
              
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Star className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-2">Data evaluasi kinerja belum tersedia</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HalamanDetailPegawai;