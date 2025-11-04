import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePegawai } from '../hooks/usePegawai';
import { useRiwayatJabatan } from '../hooks/useRiwayatJabatan';
import { usePelatihan } from '../hooks/usePelatihan';
import { printProfileFull } from '../utils/printProfileFull';
import RequestChangeModal from './RequestChangeModal';
import { 
  User, 
  Building, 
  FileText, 
  Printer, 
  Calendar, 
  Phone, 
  Mail, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';
import clsx from 'clsx';

const ProfilSaya: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div>ID pegawai tidak ditemukan</div>;
  }
  
  const { pegawai, loading, error } = usePegawai(id);
  const { riwayatJabatan, loading: loadingRiwayat, error: errorRiwayat } = useRiwayatJabatan(id);
  const { pelatihan, loading: loadingPelatihan, error: errorPelatihan } = usePelatihan(id);
  const [activeTab, setActiveTab] = useState('biodata');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) return <div className="text-center py-8">Memuat...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error.message}</div>;
  if (!pegawai) return <div className="text-center py-8">Profil pegawai tidak ditemukan</div>;

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

  const handlePrint = () => {
    if (pegawai) {
      printProfileFull(pegawai, riwayatJabatan || [], pelatihan || []);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Employee Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row">
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
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{pegawai.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{pegawai.position}</p>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{pegawai.department}</p>
                  
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
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak Profil
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 md:mt-0 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ajukan Perubahan Data
                  </button>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{pegawai.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Telepon</p>
                    <p className="text-sm text-gray-900 dark:text-white">{pegawai.phone || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Bergabung</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {pegawai.joinDate ? new Date(pegawai.joinDate).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-neutral-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('biodata')}
              className={clsx(
                'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'biodata'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
              )}
            >
              <User className="h-4 w-4 mx-auto mb-1" />
              Biodata
            </button>
            <button
              onClick={() => setActiveTab('pekerjaan')}
              className={clsx(
                'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'pekerjaan'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
              )}
            >
              <Briefcase className="h-4 w-4 mx-auto mb-1" />
              Pekerjaan
            </button>
            <button
              onClick={() => setActiveTab('riwayat-jabatan')}
              className={clsx(
                'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'riwayat-jabatan'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
              )}
            >
              <Building className="h-4 w-4 mx-auto mb-1" />
              Riwayat Jabatan
            </button>
            <button
              onClick={() => setActiveTab('pelatihan')}
              className={clsx(
                'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'pelatihan'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
              )}
            >
              <GraduationCap className="h-4 w-4 mx-auto mb-1" />
              Pelatihan
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Biodata Tab */}
          {activeTab === 'biodata' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informasi Pribadi</h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">NIP</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.nip}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.name}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Tempat, Tanggal Lahir</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">
                        {pegawai.pob}, {pegawai.dob ? new Date(pegawai.dob).toLocaleDateString('id-ID') + ' (' + calculateAge(pegawai.dob) + ')' : '-'}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Jenis Kelamin</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">
                        {pegawai.jenis_kelamin === 'L' ? 'Laki-laki' : 
                         pegawai.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Agama</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.religion || '-'}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Status Perkawinan</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.maritalStatus || '-'}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah Anak</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.numberOfChildren || 0}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Alamat</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat Lengkap</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{pegawai.address || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pekerjaan Tab */}
          {activeTab === 'pekerjaan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detail Pekerjaan</h3>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Jabatan</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.position}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Pangkat</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.pangkat || '-'}</div>
                    </div>

                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Golongan</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.golongan || '-'}</div>
                    </div>

                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Departemen</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.department}</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Bergabung</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">
                        {pegawai.joinDate ? new Date(pegawai.joinDate).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                      <div className="w-2/3 text-sm text-gray-900 dark:text-white">
                        {pegawai.isActive === false ? 'Nonaktif' : 'Aktif'}
                      </div>
                    </div>
                    
                    {pegawai.pangkat && (
                      <div className="flex">
                        <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Pangkat</div>
                        <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.pangkat}</div>
                      </div>
                    )}
                    
                    {pegawai.golongan && (
                      <div className="flex">
                        <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Golongan</div>
                        <div className="w-2/3 text-sm text-gray-900 dark:text-white">{pegawai.golongan}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informasi Tambahan</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Catatan</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">-</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Riwayat Jabatan Tab */}
          {activeTab === 'riwayat-jabatan' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Riwayat Jabatan</h3>
              
              {loadingRiwayat ? (
                <div className="text-center py-4">Memuat riwayat jabatan...</div>
              ) : errorRiwayat ? (
                <div className="text-center py-4 text-red-500">Error: {errorRiwayat.message}</div>
              ) : riwayatJabatan.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Belum ada riwayat jabatan.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-700">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Jabatan Lama</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Jabatan Baru</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Unit Kerja</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal Perubahan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 bg-white dark:bg-neutral-800">
                      {riwayatJabatan.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{item.jabatan_lama}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.jabatan_baru}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.unit_kerja || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.tanggal_perubahan).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Pelatihan Tab */}
          {activeTab === 'pelatihan' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Riwayat Pelatihan</h3>
              
              {loadingPelatihan ? (
                <div className="text-center py-4">Memuat riwayat pelatihan...</div>
              ) : errorPelatihan ? (
                <div className="text-center py-4 text-red-500">Error: {errorPelatihan.message}</div>
              ) : pelatihan.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Belum ada riwayat pelatihan.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-700">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Nama Pelatihan</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Penyelenggara</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 bg-white dark:bg-neutral-800">
                      {pelatihan.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{item.nama_pelatihan}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.penyelenggara}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{item.nomor_sertifikat || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RequestChangeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={id}
      />
    </div>
  );
};

export default ProfilSaya;
