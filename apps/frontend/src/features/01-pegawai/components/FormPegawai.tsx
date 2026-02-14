import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Pegawai, EducationHistory } from '../types';
import { createPegawaiWithUser } from '../api/employeeApi';
import { getJabatanList, Jabatan } from '../api/jabatanApi';
import { getPegawai } from '../api/employeeApi';
import { isValidEmail, isValidName, sanitizeText } from '../../../shared/utils/validation';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface FormPegawaiProps {
  onEmployeeAdded?: () => void;
}

const FormPegawai: React.FC<FormPegawaiProps> = ({ onEmployeeAdded }) => {
  const { register: registerForm, control, handleSubmit, setError, setValue, watch, formState: { errors } } = useForm<Pegawai>({
    defaultValues: { educationHistory: [] as EducationHistory[] }
  });
  const { fields, append, remove } = useFieldArray({
    control, name: 'educationHistory'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Jabatan & Atasan state
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [atasanList, setAtasanList] = useState<Pegawai[]>([]);
  const watchedJabatanId = watch('jabatan_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jabatanData, pegawaiRes] = await Promise.all([
          getJabatanList(),
          getPegawai()
        ]);
        setJabatanList(jabatanData);
        const pegawaiData = pegawaiRes?.data || pegawaiRes;
        setAtasanList(Array.isArray(pegawaiData) ? pegawaiData : []);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchData();
  }, []);

  // Auto-fill position & department when jabatan changes
  useEffect(() => {
    if (watchedJabatanId) {
      const jabatan = jabatanList.find(j => j.id === Number(watchedJabatanId));
      if (jabatan) {
        setValue('position', jabatan.nama);
        setValue('department', jabatan.department || '');
      }
    }
  }, [watchedJabatanId, jabatanList, setValue]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
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
    if (!isValidName(data.name)) {
      setError('name', { type: 'manual', message: 'Nama tidak valid' });
      return;
    }
    if (!isValidEmail(data.email)) {
      setError('email', { type: 'manual', message: 'Email tidak valid' });
      return;
    }

    if (isSubmitting) return;

    const sanitizedData = {
      ...data,
      name: sanitizeText(data.name),
      email: data.email,
      position: sanitizeText(data.position),
      department: sanitizeText(data.department),
    };

    setIsSubmitting(true);
    try {
      await createPegawaiWithUser(sanitizedData, selectedPhoto || undefined);
      alert('Pegawai dan akun pengguna berhasil ditambahkan!');
      if (onEmployeeAdded) {
        onEmployeeAdded();
      }
    } catch (error) {
      alert('Gagal menambahkan pegawai atau akun pengguna. Silakan coba lagi.');
      console.error('Error creating employee with user account:', error);
    }
    setIsSubmitting(false);
  };

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  const maritalStatuses = ['Lajang', 'Menikah', 'Duda', 'Janda'];

  const inputClass = clsx("w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors",
    "border border-gray-300 focus:ring-primary-500 focus:border-primary-500",
    "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:ring-primary-400 dark:focus:border-primary-400");

  return (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg max-h-[70vh] overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold text-primary-800 dark:text-primary-200 mb-6 text-center font-serif">Tambah Pegawai Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input id="name" {...registerForm('name', { required: 'Nama wajib diisi' })} className={inputClass} />
            {errors.name && <span className="text-red-500 text-sm dark:text-red-400">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIP</label>
            <input id="nip" {...registerForm('nip', { required: 'NIP wajib diisi' })} className={inputClass} />
            {errors.nip && <span className="text-red-500 text-sm dark:text-red-400">{errors.nip.message}</span>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input id="email" type="email" {...registerForm('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/, message: 'Format email tidak valid' } })} className={inputClass} />
            {errors.email && <span className="text-red-500 text-sm dark:text-red-400">{errors.email.message}</span>}
          </div>

          {/* === JABATAN DROPDOWN === */}
          <div>
            <label htmlFor="jabatan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jabatan <span className="text-xs text-gray-400">(otomatis isi Posisi & Departemen)</span>
            </label>
            <select id="jabatan_id" {...registerForm('jabatan_id', { valueAsNumber: true })} className={inputClass}>
              <option value="">-- Pilih Jabatan --</option>
              {jabatanList.map(j => (
                <option key={j.id} value={j.id}>
                  {'  '.repeat(j.level - 1)}{j.nama} ({j.department || '-'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posisi</label>
            <input id="position" {...registerForm('position', { required: 'Posisi wajib diisi' })} className={clsx(inputClass, watchedJabatanId && 'bg-gray-100 dark:bg-neutral-600')} readOnly={!!watchedJabatanId} />
            {errors.position && <span className="text-red-500 text-sm dark:text-red-400">{errors.position.message}</span>}
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
            <input id="department" {...registerForm('department', { required: 'Departemen wajib diisi' })} className={clsx(inputClass, watchedJabatanId && 'bg-gray-100 dark:bg-neutral-600')} readOnly={!!watchedJabatanId} />
            {errors.department && <span className="text-red-500 text-sm dark:text-red-400">{errors.department.message}</span>}
          </div>

          {/* === ATASAN DROPDOWN === */}
          <div>
            <label htmlFor="atasan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atasan Langsung</label>
            <select id="atasan_id" {...registerForm('atasan_id')} className={inputClass}>
              <option value="">-- Pilih Atasan --</option>
              {atasanList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.position || '-'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pangkat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pangkat</label>
            <input id="pangkat" {...registerForm('pangkat')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="golongan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Golongan</label>
            <input id="golongan" {...registerForm('golongan')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Bergabung</label>
            <input id="joinDate" type="date" {...registerForm('joinDate', { required: 'Tanggal bergabung wajib diisi' })} className={inputClass} />
            {errors.joinDate && <span className="text-red-500 text-sm dark:text-red-400">{errors.joinDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
            <textarea id="address" {...registerForm('address')} rows={3} className={inputClass}></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
            <input id="phone" type="tel" {...registerForm('phone')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
            <input id="pob" {...registerForm('pob')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
            <input id="dob" type="date" {...registerForm('dob')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="religion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agama</label>
            <select id="religion" {...registerForm('religion')} className={inputClass}>
              <option value="">Pilih Agama</option>
              {religions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Perkawinan</label>
            <select id="maritalStatus" {...registerForm('maritalStatus')} className={inputClass}>
              <option value="">Pilih Status</option>
              {maritalStatuses.map(ms => <option key={ms} value={ms}>{ms}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="numberOfChildren" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Anak</label>
            <input id="numberOfChildren" type="number" {...registerForm('numberOfChildren', { valueAsNumber: true, min: { value: 0, message: 'Jumlah anak tidak boleh negatif' } })} className={inputClass} />
            {errors.numberOfChildren && <span className="text-red-500 text-sm dark:text-red-400">{errors.numberOfChildren.message}</span>}
          </div>
          <div>
            <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
            <select id="jenis_kelamin" {...registerForm('jenis_kelamin')} className={inputClass}>
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Education History Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Riwayat Pendidikan</h3>
          {fields.map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <input
                {...registerForm(`educationHistory.${index}.level` as const)}
                placeholder="Jenjang (e.g., S1)"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              />
              <input
                {...registerForm(`educationHistory.${index}.schoolName` as const)}
                placeholder="Nama Sekolah"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              />
              <input
                {...registerForm(`educationHistory.${index}.major` as const)}
                placeholder="Jurusan"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              />
              <div className="flex items-center">
                <input
                  {...registerForm(`educationHistory.${index}.graduationYear` as const)}
                  placeholder="Tahun Lulus"
                  className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                />
                <button type="button" onClick={() => remove(index)} className="ml-2 text-red-500 hover:text-red-700" title="Hapus Pendidikan" aria-label="Hapus Pendidikan">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ level: '', schoolName: '', major: '', graduationYear: '' })}
            className="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 border border-dashed border-primary-500 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          >
            + Tambah Pendidikan
          </button>
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
                  title="Hapus Foto"
                  aria-label="Hapus Foto"
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
                title="Unggah Foto Profil"
              />
              <label htmlFor="photo" className="sr-only">Unggah Foto Profil</label>
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
                Format: JPG, PNG. Ukuran maks: 5MB
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