import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { addPelatihan } from '../api/pelatihanApi';
import { usePelatihan } from '../hooks/usePelatihan';

interface TambahPelatihanFormProps {
  onPelatihanAdded?: () => void;
}

const TambahPelatihanForm: React.FC<TambahPelatihanFormProps> = ({ onPelatihanAdded }) => {
  const [selectedAssignedId, setSelectedAssignedId] = useState<string>('');
  const [trainingName, setTrainingName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [certificateName, setCertificateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { pelatihan = [], refetch } = usePelatihan();

  // Auto-fill from assigned trainings if available
  useEffect(() => {
    if (pelatihan && pelatihan.length > 0) {
      // Find latest assigned training or one that doesn't have a certificate uploaded yet
      const pendingAssigned = pelatihan.find((p) => !p.nomor_sertifikat) || pelatihan[0];
      if (pendingAssigned && !selectedAssignedId) {
        setSelectedAssignedId(String(pendingAssigned.id));
        setTrainingName(pendingAssigned.nama_pelatihan || '');
        setOrganizer(pendingAssigned.penyelenggara || '');
        setStartDate(pendingAssigned.tanggal_mulai ? pendingAssigned.tanggal_mulai.substring(0, 10) : '');
        setEndDate(pendingAssigned.tanggal_selesai ? pendingAssigned.tanggal_selesai.substring(0, 10) : '');
        setInfoMessage('Form terisi otomatis berdasarkan pelatihan yang ditugaskan oleh Admin / Supervisor.');
      }
    }
  }, [pelatihan]);

  const handleSelectAssigned = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAssignedId(val);
    if (!val) {
      setTrainingName('');
      setOrganizer('');
      setStartDate('');
      setEndDate('');
      setInfoMessage(null);
      return;
    }
    const selected = pelatihan.find((p) => String(p.id) === val);
    if (selected) {
      setTrainingName(selected.nama_pelatihan || '');
      setOrganizer(selected.penyelenggara || '');
      setStartDate(selected.tanggal_mulai ? selected.tanggal_mulai.substring(0, 10) : '');
      setEndDate(selected.tanggal_selesai ? selected.tanggal_selesai.substring(0, 10) : '');
      setInfoMessage('Form terisi otomatis dari data pelatihan terpilih.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran file maksimal 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setCertificate(file);
      setCertificateName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user || !user.employeeId) {
      setError('ID pegawai tidak ditemukan. Silakan login ulang.');
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
      setSelectedAssignedId('');
      setTrainingName('');
      setOrganizer('');
      setStartDate('');
      setEndDate('');
      setCertificate(null);
      setCertificateName('');
      setInfoMessage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      refetch();

      if (onPelatihanAdded) {
        onPelatihanAdded();
      }
    } catch (err: any) {
      console.error('Error adding training:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data pelatihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-neutral-900">Input Data / Upload Sertifikat Pelatihan</h2>

      {pelatihan && pelatihan.length > 0 && (
        <div className="mb-4 bg-indigo-50 p-3.5 rounded-lg border border-indigo-100">
          <label className="block text-sm font-medium text-indigo-900 mb-1">
            Pilih Pelatihan yang Ditugaskan (Auto-fill Form)
          </label>
          <select
            value={selectedAssignedId}
            onChange={handleSelectAssigned}
            className="w-full px-3 py-2 border border-indigo-300 bg-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Buat / Ketik Manual Pelatihan Baru --</option>
            {pelatihan.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_pelatihan} ({p.penyelenggara}) - {p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID') : ''}
              </option>
            ))}
          </select>
          {infoMessage && (
            <p className="mt-1.5 text-xs text-indigo-700 font-medium flex items-center">
              ✓ {infoMessage}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Training Name */}
          <div>
            <label htmlFor="trainingName" className="block text-sm font-medium text-neutral-700 mb-1">
              Nama Pelatihan *
            </label>
            <input
              type="text"
              id="trainingName"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Masukkan nama pelatihan"
            />
          </div>

          {/* Organizer */}
          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-neutral-700 mb-1">
              Penyelenggara *
            </label>
            <input
              type="text"
              id="organizer"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Masukkan nama penyelenggara"
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Tanggal Selesai *
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Certificate Upload */}
          <div className="md:col-span-2">
            <label htmlFor="certificate" className="block text-sm font-medium text-neutral-700 mb-1">
              Upload Sertifikat (PDF / Gambar / Doc)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="certificate"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-200 text-sm font-medium transition"
              >
                Pilih File Sertifikat
              </button>
              <span className="ml-3 text-sm text-neutral-600 truncate max-w-xs">
                {certificateName || 'Belum ada file dipilih'}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Format: PDF, Gambar, atau Document. Maksimal 10MB</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-indigo-900 focus:outline-none transition"
          >
            {loading ? 'Menyimpan...' : 'Simpan / Upload Sertifikat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahPelatihanForm;