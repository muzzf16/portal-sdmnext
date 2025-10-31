import React, { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { addPelatihan } from '../api/pelatihanApi';
import { usePelatihan } from '../hooks/usePelatihan';

interface TambahPelatihanFormProps {
  onPelatihanAdded?: () => void;
}

const TambahPelatihanForm: React.FC<TambahPelatihanFormProps> = ({ onPelatihanAdded }) => {
  const [trainingName, setTrainingName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [certificateName, setCertificateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { refetch } = usePelatihan(); // Get the refetch function from the hook

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        setError('Hanya file PDF yang diperbolehkan');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setCertificate(file);
      setCertificateName(file.name);
      setError(null); // Clear any previous errors
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Anda harus login untuk menambahkan pelatihan');
      return;
    }
    
    if (!trainingName || !organizer || !startDate || !endDate) {
      setError('Semua field wajib diisi');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nama_pelatihan', trainingName);
      formData.append('penyelenggara', organizer);
      formData.append('tanggal_mulai', startDate);
      formData.append('tanggal_selesai', endDate);
      
      if (certificate) {
        formData.append('certificate', certificate, certificate.name);
      }

      await addPelatihan(user.employeeId.toString(), formData);

      // Reset form
      setTrainingName('');
      setOrganizer('');
      setStartDate('');
      setEndDate('');
      setCertificate(null);
      setCertificateName('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call the refetch function to update the training list
      refetch();
      
      // Call the optional callback if provided
      if (onPelatihanAdded) {
        onPelatihanAdded();
      }
    } catch (err: any) {
      console.error('Error adding training:', err);
      setError(err.response?.data?.message || 'Gagal menambahkan pelatihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Tambah Pelatihan</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Name */}
          <div>
            <label htmlFor="trainingName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pelatihan *
            </label>
            <input
              type="text"
              id="trainingName"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan nama pelatihan"
            />
          </div>
          
          {/* Organizer */}
          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              Penyelenggara *
            </label>
            <input
              type="text"
              id="organizer"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan nama penyelenggara"
            />
          </div>
          
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai *
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Certificate Upload */}
          <div className="md:col-span-2">
            <label htmlFor="certificate" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Sertifikat (PDF)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="certificate"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Pilih File
              </button>
              <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                {certificateName || 'Belum ada file dipilih'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Format: PDF, maksimal 5MB</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pelatihan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahPelatihanForm;