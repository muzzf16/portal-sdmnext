import React, { useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Pegawai } from '../types';
import { createPegawai } from '../api/employeeApi';
import { isValidEmail, isValidName, sanitizeText } from '../../../shared/utils/validation';
import clsx from 'clsx';
import { X } from 'lucide-react';

const FormPegawai: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<Omit<Pegawai, 'id'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    // Perform client-side validation
    if (!isValidName(data.name)) {
      setError('name', {
        type: 'manual',
        message: 'Nama tidak valid'
      });
      return;
    }
    
    if (!isValidEmail(data.email)) {
      setError('email', {
        type: 'manual',
        message: 'Email tidak valid'
      });
      return;
    }
    
    // Sanitize text inputs
    const sanitizedData = {
      ...data,
      name: sanitizeText(data.name),
      email: data.email, // Email should already be validated, no need to sanitize
      position: sanitizeText(data.position),
      department: sanitizeText(data.department),
    };

    setIsSubmitting(true);
    try {
      await createPegawai(sanitizedData, selectedPhoto || undefined);
      // Handle success (e.g., close modal, refresh list)
      alert('Pegawai berhasil ditambahkan!'); // Temporary success message
    } catch (error) {
      // Handle error
      alert('Gagal menambahkan pegawai.'); // Temporary error message
      console.error('Error creating pegawai:', error);
    }
    setIsSubmitting(false);
  };

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  const maritalStatuses = ['Lajang', 'Menikah', 'Duda', 'Janda'];

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg max-h-[70vh] overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold text-primary-800 dark:text-primary-200 mb-6 text-center font-serif">Tambah Pegawai Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input
              id="name"
              {...register('name', { required: 'Nama wajib diisi' })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.name && <span className="text-red-500 text-sm dark:text-red-400">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIP</label>
            <input
              id="nip"
              {...register('nip', { required: 'NIP wajib diisi' })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.nip && <span className="text-red-500 text-sm dark:text-red-400">{errors.nip.message}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/, message: 'Format email tidak valid' } })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.email && <span className="text-red-500 text-sm dark:text-red-400">{errors.email.message}</span>}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posisi</label>
            <input
              id="position"
              {...register('position', { required: 'Posisi wajib diisi' })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.position && <span className="text-red-500 text-sm dark:text-red-400">{errors.position.message}</span>}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
            <input
              id="department"
              {...register('department', { required: 'Departemen wajib diisi' })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.department && <span className="text-red-500 text-sm dark:text-red-400">{errors.department.message}</span>}
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Bergabung</label>
            <input
              id="joinDate"
              type="date"
              {...register('joinDate', { required: 'Tanggal bergabung wajib diisi' })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.joinDate && <span className="text-red-500 text-sm dark:text-red-400">{errors.joinDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
            <textarea
              id="address"
              {...register('address')}
              rows={3}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            ></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
          </div>
          <div>
            <label htmlFor="pob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
            <input
              id="pob"
              {...register('pob')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
            <input
              id="dob"
              type="date"
              {...register('dob')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
          </div>
          <div>
            <label htmlFor="religion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agama</label>
            <select
              id="religion"
              {...register('religion')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            >
              <option value="">Pilih Agama</option>
              {religions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Perkawinan</label>
            <select
              id="maritalStatus"
              {...register('maritalStatus')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            >
              <option value="">Pilih Status</option>
              {maritalStatuses.map(ms => <option key={ms} value={ms}>{ms}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="numberOfChildren" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Anak</label>
            <input
              id="numberOfChildren"
              type="number"
              {...register('numberOfChildren', { valueAsNumber: true, min: { value: 0, message: 'Jumlah anak tidak boleh negatif' } })}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            />
            {errors.numberOfChildren && <span className="text-red-500 text-sm dark:text-red-400">{errors.numberOfChildren.message}</span>}
          </div>
          <div>
            <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
            <select
              id="jenis_kelamin"
              {...register('jenis_kelamin')}
              className={clsx(
                "w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
                "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
                "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400"
              )}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Profil</label>
          <div className="flex items-center space-x-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
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
              <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-xs">Foto</span>
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
                className={clsx(
                  "w-full px-4 py-2 font-medium rounded-md transition-colors",
                  "bg-primary-100 text-primary-700 hover:bg-primary-200",
                  "dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/50"
                )}
              >
                {previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: JPG, PNG. Ukuran maks: 2MB
              </p>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "w-full px-4 py-2 font-bold text-white rounded-md transition-colors duration-200",
            "bg-primary-700 hover:bg-primary-800 disabled:bg-gray-400",
            "dark:bg-primary-600 dark:hover:bg-primary-700 dark:disabled:bg-neutral-600"
          )}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim'}
        </button>
      </form>
    </div>
  );
};

export default FormPegawai;
