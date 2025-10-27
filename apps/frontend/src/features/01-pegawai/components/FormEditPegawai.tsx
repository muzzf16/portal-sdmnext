import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Pegawai } from '../types';
import { updatePegawai } from '../api/employeeApi';
import { usePegawai } from '../hooks/usePegawai';
import { X } from 'lucide-react';

interface FormEditPegawaiProps {
  employeeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormEditPegawai: React.FC<FormEditPegawaiProps> = ({ employeeId, onSuccess, onCancel }) => {
  const { pegawai, loading, error } = usePegawai(employeeId);
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<Omit<Pegawai, 'id'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(pegawai?.avatarUrl || null);

  useEffect(() => {
    if (pegawai) {
      reset(pegawai); // Populate form with existing employee data
      setPreviewUrl(pegawai.avatarUrl || null);
    }
  }, [pegawai, reset]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: Omit<Pegawai, 'id'>) => {
    setIsSubmitting(true);
    try {
      await updatePegawai(employeeId, data, selectedPhoto || undefined);
      alert('Pegawai berhasil diperbarui!');
      onSuccess();
    } catch (err) {
      alert('Gagal memperbarui pegawai.');
      console.error('Error updating pegawai:', err);
    }
    setIsSubmitting(false);
  };

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  const maritalStatuses = ['Lajang', 'Menikah', 'Duda', 'Janda'];

  if (loading) return <div>Memuat data pegawai...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pegawai) return <div>Pegawai tidak ditemukan.</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Edit Pegawai</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              id="name"
              {...register('name', { required: 'Nama wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
            <input
              id="nip"
              {...register('nip', { required: 'NIP wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.nip && <span className="text-red-500 text-sm">{errors.nip.message}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">Posisi</label>
            <input
              id="position"
              {...register('position', { required: 'Posisi wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.position && <span className="text-red-500 text-sm">{errors.position.message}</span>}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <input
              id="department"
              {...register('department', { required: 'Departemen wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.department && <span className="text-red-500 text-sm">{errors.department.message}</span>}
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Bergabung</label>
            <input
              id="joinDate"
              type="date"
              {...register('joinDate', { required: 'Tanggal bergabung wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.joinDate && <span className="text-red-500 text-sm">{errors.joinDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <textarea
              id="address"
              {...register('address')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="pob" className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
            <input
              id="pob"
              {...register('pob')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
            <input
              id="dob"
              type="date"
              {...register('dob')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="religion" className="block text-sm font-medium text-slate-700 mb-1">Agama</label>
            <select
              id="religion"
              {...register('religion')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Agama</option>
              {religions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-slate-700 mb-1">Status Perkawinan</label>
            <select
              id="maritalStatus"
              {...register('maritalStatus')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Status</option>
              {maritalStatuses.map(ms => <option key={ms} value={ms}>{ms}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="numberOfChildren" className="block text-sm font-medium text-slate-700 mb-1">Jumlah Anak</label>
            <input
              id="numberOfChildren"
              type="number"
              {...register('numberOfChildren', { valueAsNumber: true, min: { value: 0, message: 'Jumlah anak tidak boleh negatif' } })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.numberOfChildren && <span className="text-red-500 text-sm">{errors.numberOfChildren.message}</span>}
          </div>
          <div>
            <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
            <select
              id="jenis_kelamin"
              {...register('jenis_kelamin')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil</label>
          <div className="flex items-center space-x-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-300"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-slate-500 text-xs">Foto</span>
              </div>
            )}
            <div className="flex-1">
              <input
                id="photo"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
              </button>
              <p className="text-xs text-slate-500 mt-1">
                Format: JPG, PNG. Ukuran maks: 2MB
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 font-bold text-primary-dark-blue border border-primary-dark-blue rounded-md hover:bg-primary-dark-blue hover:text-white transition-colors duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
          >
            {isSubmitting ? 'Memperbarui...' : 'Perbarui'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEditPegawai;