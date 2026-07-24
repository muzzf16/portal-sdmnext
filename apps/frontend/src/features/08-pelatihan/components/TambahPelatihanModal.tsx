import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { usePegawaiList } from '@/features/01-pegawai/hooks/usePegawaiList';
import { addPelatihanGeneral, updatePelatihan } from '../api/pelatihanApi';
import { Pelatihan } from '@/shared/types/types';

interface TambahPelatihanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: Pelatihan | null;
}

export const TambahPelatihanModal: React.FC<TambahPelatihanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem = null,
}) => {
  const { pegawai = [] } = usePegawaiList();
  const [employeeId, setEmployeeId] = useState('');
  const [trainingName, setTrainingName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [suratPenawaran, setSuratPenawaran] = useState<File | null>(null);
  const [sppd, setSppd] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suratPenawaranRef = useRef<HTMLInputElement>(null);
  const sppdRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setEmployeeId(editingItem.pegawai_id || editingItem.employeeId || '');
      setTrainingName(editingItem.nama_pelatihan || editingItem.trainingName || '');
      setOrganizer(editingItem.penyelenggara || editingItem.organizer || '');
      setStartDate(editingItem.tanggal_mulai ? editingItem.tanggal_mulai.substring(0, 10) : '');
      setEndDate(editingItem.tanggal_selesai ? editingItem.tanggal_selesai.substring(0, 10) : '');
    } else {
      setEmployeeId('');
      setTrainingName('');
      setOrganizer('');
      setStartDate('');
      setEndDate('');
      setSuratPenawaran(null);
      setSppd(null);
      setCertificate(null);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Silakan pilih peserta (pegawai)');
      return;
    }
    if (!trainingName || !organizer || !startDate || !endDate) {
      setError('Nama pelatihan, penyelenggara, dan tanggal wajib diisi');
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
      formData.append('pegawai_id', employeeId);
      formData.append('nama_pelatihan', trainingName);
      formData.append('penyelenggara', organizer);
      formData.append('tanggal_mulai', startDate);
      formData.append('tanggal_selesai', endDate);

      if (suratPenawaran) {
        formData.append('surat_penawaran', suratPenawaran, suratPenawaran.name);
      }
      if (sppd) {
        formData.append('surat_jalan', sppd, sppd.name);
        formData.append('sppd', sppd, sppd.name);
      }
      if (certificate) {
        formData.append('certificate', certificate, certificate.name);
      }

      if (editingItem && editingItem.id) {
        await updatePelatihan(editingItem.id, formData);
      } else {
        await addPelatihanGeneral(formData);
      }

      // Reset
      setEmployeeId('');
      setTrainingName('');
      setOrganizer('');
      setStartDate('');
      setEndDate('');
      setSuratPenawaran(null);
      setSppd(null);
      setCertificate(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving pelatihan:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data pelatihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">
            {editingItem ? 'Edit Data Pelatihan Pegawai' : 'Tambah Data Pelatihan Pegawai'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Peserta (Pegawai) *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">-- Pilih Peserta Pegawai --</option>
                {pegawai.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.position ? `(${p.position})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nama Pelatihan *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama pelatihan"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Penyelenggara *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama penyelenggara"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Surat Penawaran (PDF/Doc/Image)
              </label>
              <input
                type="file"
                ref={suratPenawaranRef}
                onChange={(e) => setSuratPenawaran(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="w-full text-sm text-neutral-500 border border-neutral-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {editingItem?.surat_penawaran && !suratPenawaran && (
                <p className="text-xs text-neutral-500 mt-1">Berkas saat ini: {editingItem.surat_penawaran}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                SPPD (PDF/Doc/Image)
              </label>
              <input
                type="file"
                ref={sppdRef}
                onChange={(e) => setSppd(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="w-full text-sm text-neutral-500 border border-neutral-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {(editingItem?.surat_jalan || editingItem?.sppd) && !sppd && (
                <p className="text-xs text-neutral-500 mt-1">Berkas saat ini: {editingItem.surat_jalan || editingItem.sppd}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sertifikat (Opsional)
              </label>
              <input
                type="file"
                ref={certificateRef}
                onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="w-full text-sm text-neutral-500 border border-neutral-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {editingItem?.nomor_sertifikat && !certificate && (
                <p className="text-xs text-neutral-500 mt-1">Berkas saat ini: {editingItem.nomor_sertifikat}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {editingItem ? 'Simpan Perubahan' : 'Simpan Pelatihan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPelatihanModal;
