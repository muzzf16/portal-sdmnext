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
                
                <button 
                  onClick={handlePrint}
                  className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Profil
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 md:mt-0 md:ml-4 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ajukan Perubahan Data
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ... contact info ... */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and other content... */}

      <RequestChangeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={id}
      />
    </div>
  );
};

export default ProfilSaya;