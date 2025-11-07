import React, { useState, useEffect } from 'react';
import { UserCog, Building, Database, Users, Download, Upload } from 'lucide-react';
import clsx from 'clsx';
import { DaftarPengguna } from '../components/DaftarPengguna';
import { UbahPasswordPengguna } from '../components/UbahPasswordPengguna';
import { UbahRole } from '../components/UbahRole';
import { ResetPassword } from '../components/ResetPassword';

import { backupDatabase, restoreDatabase } from '@/shared/services/backup.service';
import { updateCompanySettings } from '@/shared/services/company-settings.service';
import { useCompanySettings } from '@/shared/contexts/CompanySettingsContext';

const HalamanPengaturan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'company' | 'backup'>('users');
  const { settings, loading: settingsLoading, refetch } = useCompanySettings();
  
  const [companySettings, setCompanySettings] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setCompanySettings(settings);
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    }
  }, [settings]);

  const handleBackup = () => {
    backupDatabase().then((response) => {
      alert(response.data.message);
    });
  };

  const handleRestore = () => {
    restoreDatabase().then((response) => {
      alert(response.data.message);
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(companySettings, logoFile).then(() => {
      alert('Pengaturan perusahaan berhasil diperbarui.');
      refetch(); // Refetch settings to update context
    }).catch(err => {
      console.error(err);
      alert('Gagal memperbarui pengaturan perusahaan.');
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-8">Pengaturan</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <UserCog className="h-5 w-5 mr-2" />
            Manajemen Pengguna
          </button>
          
          <button
            onClick={() => setActiveTab('company')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              activeTab === 'company'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Building className="h-5 w-5 mr-2" />
            Pengaturan Perusahaan
          </button>
          
          <button
            onClick={() => setActiveTab('backup')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              activeTab === 'backup'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Database className="h-5 w-5 mr-2" />
            Backup & Restore
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6">
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
              Manajemen Pengguna
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UbahRole />
              <ResetPassword />
              <UbahPasswordPengguna />
            </div>
            
            <DaftarPengguna />
          </div>
        )}
        
        {activeTab === 'company' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Building className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
              Pengaturan Perusahaan
            </h2>
            
            {settingsLoading ? <p>Loading...</p> : (
            <form className="space-y-6" onSubmit={handleUpdateCompanySettings}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                    placeholder="Masukkan nama perusahaan"
                    value={companySettings.companyName || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="npwp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor NPWP
                  </label>
                  <input
                    type="text"
                    id="npwp"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                    placeholder="Masukkan nomor NPWP"
                    value={companySettings.npwp || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, npwp: e.target.value })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alamat Perusahaan
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                    placeholder="Masukkan alamat lengkap perusahaan"
                    value={companySettings.address || ''}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo Perusahaan
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-md bg-gray-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Logo</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-5">
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="logo-upload"
                          className="relative cursor-pointer bg-white dark:bg-neutral-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 dark:bg-neutral-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <span>Upload file</span>
                          <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg" />
                        </label>
                        <p className="pl-1">atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG hingga 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:hover:bg-neutral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
            )}
          </div>
        )}
        
        {activeTab === 'backup' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Database className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
              Backup & Restore Data
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Data Card */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center mb-4">
                  <Download className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200">Export Data</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export seluruh data sistem ke file format CSV atau JSON untuk backup.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pilih Data untuk Diexport:
                    </label>
                    <div className="space-y-2">
                      {['Pegawai', 'Absensi', 'Cuti', 'Penggajian', 'Kontrak'].map((item) => (
                        <div key={item} className="flex items-center">
                          <input
                            id={`export-${item}`}
                            name="export-data"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-neutral-700 dark:border-neutral-600"
                          />
                          <label htmlFor={`export-${item}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Format File:
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="export-csv"
                          name="export-format"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          defaultChecked
                        />
                        <label htmlFor="export-csv" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                          CSV
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="export-json"
                          name="export-format"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="export-json" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                          JSON
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleBackup} className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                    Export Data Sekarang
                  </button>
                </div>
              </div>
              
              {/* Import Data Card */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center mb-4">
                  <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200">Import Data</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import data dari file CSV atau JSON untuk memulihkan backup.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pilih File:
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-neutral-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="import-file"
                            className="relative cursor-pointer bg-white dark:bg-neutral-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 dark:bg-neutral-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <span>Upload file</span>
                            <input id="import-file" name="import-file" type="file" className="sr-only" accept=".csv,.json" />
                          </label>
                          <p className="pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CSV atau JSON hingga 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Opsi Import:
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="overwrite"
                          name="import-options"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-neutral-700 dark:border-neutral-600"
                        />
                        <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                          Timpa data yang sudah ada
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="skip-errors"
                          name="import-options"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-neutral-700 dark:border-neutral-600"
                          defaultChecked
                        />
                        <label htmlFor="skip-errors" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                          Lewati baris dengan error
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleRestore} className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors">
                    Import Data
                  </button>
                </div>
              </div>
            </div>
            
            {/* Backup History */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Riwayat Backup</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                  <thead className="bg-gray-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal & Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jenis Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ukuran File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                    {/* Sample backup history */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2023-12-01 10:30</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Seluruh Data</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2.4 MB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                          Download
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Hapus
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2023-11-15 14:45</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Data Pegawai</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">1.1 MB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                          Download
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanPengaturan;
