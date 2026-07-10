import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Kontrak } from '../types';
import { buatKontrak, buatKontrakWithFile } from '../api/kontrakApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { useToast } from '@/app/providers/ToastContext';

type KontrakFormData = Omit<Kontrak, 'id' | 'createdAt' | 'contractFile' | 'notes'> & { 
  notes?: string;
  tanggalCalonPegawai?: string;
  tanggalKenaikanPangkatTerakhir?: string;
  tanggalKenaikanPangkatSelanjutnya?: string;
  tanggalKenaikanGajiBerkala?: string;
  pangkat?: string;
  golongan?: string;
};

interface FormKontrakProps {
  onSuccess?: () => void;
}

const FormKontrak: React.FC<FormKontrakProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } = useForm<KontrakFormData>();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [addRiwayatJabatan, setAddRiwayatJabatan] = useState(true);
  const [jabatanLama, setJabatanLama] = useState('');
  const [originalPosition, setOriginalPosition] = useState(''); // Simpan posisi asli dari database
  const [jabatanBaru, setJabatanBaru] = useState(''); // State terpisah untuk jabatan baru

  // Watch date fields for validation
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const selectedEmployeeId = watch('employeeId');

  // Load employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getPegawai();
        if (response.data && Array.isArray(response.data)) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        addToast('Gagal memuat data pegawai', 'error');
      }
    };
    fetchEmployees();
  }, [addToast]);

  // Filter employees based on search term (memoized)
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const lowerSearch = searchTerm.toLowerCase();
    return employees.filter(emp =>
      emp.name?.toLowerCase().includes(lowerSearch) ||
      emp.id?.toLowerCase().includes(lowerSearch) ||
      emp.nip?.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, employees]);

  // Auto-fill position and department when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        // Simpan posisi asli dari database (jabatan lama) - non-editable
        const originalPos = selectedEmployee.position || '';
        setOriginalPosition(originalPos);
        setJabatanLama(originalPos);

        // Set jabatan baru default sama dengan posisi lama, tapi bisa diubah
        setJabatanBaru(originalPos);
        setValue('position', originalPos); // Set position di form juga
        setValue('department', selectedEmployee.department);

        // Auto-fill new fields
        setValue('pangkat', selectedEmployee.pangkat || '');
        setValue('golongan', selectedEmployee.golongan || '');
        setValue('tanggalCalonPegawai', selectedEmployee.tanggalCalonPegawai || '');
        setValue('tanggalKenaikanPangkatTerakhir', selectedEmployee.tanggalKenaikanPangkatTerakhir || '');
        setValue('tanggalKenaikanPangkatSelanjutnya', selectedEmployee.tanggalKenaikanPangkatSelanjutnya || '');
        setValue('tanggalKenaikanGajiBerkala', selectedEmployee.tanggalKenaikanGajiBerkala || '');
      }
    }
  }, [selectedEmployeeId, employees, setValue]);


  const contractTypes = useMemo(() => [
    { value: 'permanent', label: 'Permanen' },
    { value: 'temporary', label: 'Sementara' },
    { value: 'contract', label: 'Kontrak' }
  ], []);

  const contractStatuses = useMemo(() => [
    { value: 'active', label: 'Aktif' },
    { value: 'expiring', label: 'Akan Berakhir' },
    { value: 'expired', label: 'Berakhir' },
    { value: 'terminated', label: 'Dihentikan' }
  ], []);

  const handleEmployeeSelect = useCallback((employeeId: string, position: string, department: string) => {
    setValue('employeeId', employeeId);
    setValue('position', position);
    setValue('department', department);
    setShowEmployeeDropdown(false);
    setSearchTerm('');
  }, [setValue]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    } else {
      setDocumentFile(null);
    }
  }, []);

  const onSubmit = useCallback(async (data: KontrakFormData) => {
    // Validate that startDate < endDate
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      addToast('Tanggal mulai harus lebih awal dari tanggal berakhir', 'error');
      return;
    }

    try {
      // Prepare contract data with riwayat jabatan
      // Jabatan lama = posisi asli dari database (non-editable)
      // Jabatan baru = posisi yang diinput user di form (editable)
      const contractPayload = {
        ...data,
        position: jabatanBaru || data.position, // Gunakan jabatan baru yang diinput user
        addRiwayatJabatan: addRiwayatJabatan,
        riwayatJabatan: addRiwayatJabatan ? {
          jabatan_lama: jabatanLama || originalPosition || '-', // Jabatan lama (posisi sebelum kontrak baru) - non-editable
          jabatan_baru: jabatanBaru || data.position, // Jabatan baru (posisi di kontrak baru) - editable
          tanggal_perubahan: data.startDate
        } : undefined
      };

      // If there's a file to upload, use the file upload API
      if (documentFile) {
        const formData = new FormData();

        // Add contract data (including terms and salary)
        Object.entries(contractPayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'salary' && typeof value === 'number') {
              formData.append(key, value.toString());
            } else if (key === 'riwayatJabatan' && typeof value === 'object') {
              // Append riwayat jabatan as JSON string
              formData.append(key, JSON.stringify(value));
            } else if (key === 'addRiwayatJabatan') {
              formData.append(key, String(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        formData.append('contractFile', documentFile);
        await buatKontrakWithFile(formData);
      } else {
        await buatKontrak(contractPayload);
      }

      addToast('Kontrak berhasil dibuat!', 'success');
      reset();
      setDocumentFile(null);
      setSearchTerm('');
      setJabatanLama('');
      setJabatanBaru('');
      setOriginalPosition('');
      setAddRiwayatJabatan(true);
      const fileInput = document.getElementById('documentFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating kontrak:', error);
      addToast('Gagal membuat kontrak', 'error');
    }
  }, [documentFile, addToast, reset, onSuccess, addRiwayatJabatan, jabatanLama]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-dark-blue">Buat Kontrak Baru</h2>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee-search" className="block text-sm font-medium text-slate-700 mb-1">Pilih Pegawai</label>
            <div className="relative">
              <input
                id="employee-search"
                type="text"
                value={selectedEmployeeId ? '' : searchTerm} // Clear the search field when an employee is selected
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                placeholder={selectedEmployeeId ?
                  (employees.find(emp => emp.id === selectedEmployeeId)?.name || "Cari pegawai") :
                  "Cari pegawai (nama, ID, atau NIP)"
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
                onFocus={() => setShowEmployeeDropdown(true)}
                autoComplete="off"
              />
              {showEmployeeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-100"
                        onClick={() => handleEmployeeSelect(emp.id, emp.position, emp.department)}
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">{emp.name}</p>
                            <p className="text-gray-500 text-sm">{emp.id} - {emp.nip}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 px-4 text-gray-500">Tidak ditemukan pegawai</div>
                  )}
                </div>
              )}
            </div>
            {errors.employeeId && <span className="text-red-500 text-sm">{errors.employeeId.message}</span>}

            {/* Show selected employee info when one is selected */}
            {selectedEmployeeId && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                Pegawai terpilih: <span className="font-medium">
                  {employees.find(emp => emp.id === selectedEmployeeId)?.name || selectedEmployeeId}
                </span>
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800"
                  onClick={() => {
                    setValue('employeeId', '');
                    setValue('position', '');
                    setValue('department', '');
                    setValue('pangkat', '');
                    setValue('golongan', '');
                    setValue('tanggalCalonPegawai', '');
                    setValue('tanggalKenaikanPangkatTerakhir', '');
                    setValue('tanggalKenaikanPangkatSelanjutnya', '');
                    setValue('tanggalKenaikanGajiBerkala', '');
                    setOriginalPosition('');
                    setJabatanLama('');
                    setJabatanBaru('');
                  }}
                >
                  [Hapus]
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">Posisi</label>
            <input
              id="position"
              {...register('position', { required: 'Posisi wajib diisi' })}
              value={jabatanBaru}
              onChange={(e) => {
                setJabatanBaru(e.target.value);
                setValue('position', e.target.value);
              }}
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
              readOnly
            />
            {errors.department && <span className="text-red-500 text-sm">{errors.department.message}</span>}
          </div>
          <div>
            <label htmlFor="pangkat" className="block text-sm font-medium text-slate-700 mb-1">Pangkat</label>
            <input
              id="pangkat"
              {...register('pangkat')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="golongan" className="block text-sm font-medium text-slate-700 mb-1">Golongan</label>
            <input
              id="golongan"
              {...register('golongan')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
            <input
              id="startDate"
              type="date"
              {...register('startDate', {
                required: 'Tanggal mulai wajib diisi',
                validate: (value) => {
                  if (endDate && value && new Date(value) >= new Date(endDate)) {
                    return 'Tanggal mulai harus lebih awal dari tanggal berakhir';
                  }
                  return true;
                }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.startDate && <span className="text-red-500 text-sm">{errors.startDate.message}</span>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Berakhir</label>
            <input
              id="endDate"
              type="date"
              {...register('endDate', {
                required: 'Tanggal berakhir wajib diisi',
                validate: (value) => {
                  if (startDate && value && new Date(startDate) >= new Date(value)) {
                    return 'Tanggal berakhir harus lebih akhir dari tanggal mulai';
                  }
                  return true;
                }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.endDate && <span className="text-red-500 text-sm">{errors.endDate.message}</span>}
          </div>
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-slate-700 mb-1">Jenis Kontrak</label>
            <select
              id="contractType"
              {...register('contractType', { required: 'Jenis kontrak wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Jenis Kontrak</option>
              {contractTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.contractType && <span className="text-red-500 text-sm">{errors.contractType.message}</span>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status Kontrak</label>
            <select
              id="status"
              {...register('status', { required: 'Status kontrak wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Status</option>
              {contractStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
          </div>
          <div>
            <label htmlFor="tanggalCalonPegawai" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Calon Pegawai</label>
            <input
              id="tanggalCalonPegawai"
              type="date"
              {...register('tanggalCalonPegawai')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="tanggalKenaikanPangkatTerakhir" className="block text-sm font-medium text-slate-700 mb-1">Kenaikan Pangkat Terakhir</label>
            <input
              id="tanggalKenaikanPangkatTerakhir"
              type="date"
              {...register('tanggalKenaikanPangkatTerakhir')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="tanggalKenaikanPangkatSelanjutnya" className="block text-sm font-medium text-slate-700 mb-1">Kenaikan Pangkat Selanjutnya</label>
            <input
              id="tanggalKenaikanPangkatSelanjutnya"
              type="date"
              {...register('tanggalKenaikanPangkatSelanjutnya')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label htmlFor="tanggalKenaikanGajiBerkala" className="block text-sm font-medium text-slate-700 mb-1">Kenaikan Gaji Berkala</label>
            <input
              id="tanggalKenaikanGajiBerkala"
              type="date"
              {...register('tanggalKenaikanGajiBerkala')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="terms" className="block text-sm font-medium text-slate-700 mb-1">Ketentuan</label>
            <textarea
              id="terms"
              {...register('terms')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="documentFile" className="block text-sm font-medium text-slate-700 mb-1">Dokumen Kontrak</label>
            <input
              id="documentFile"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {documentFile && (
              <p className="text-sm text-gray-600 mt-1">File: {documentFile.name}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>

          {/* Riwayat Jabatan Section */}
          <div className="md:col-span-2 border-t pt-4 mt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="addRiwayatJabatan"
                checked={addRiwayatJabatan}
                onChange={(e) => setAddRiwayatJabatan(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="addRiwayatJabatan" className="ml-2 block text-sm font-medium text-slate-700">
                Tambahkan ke Riwayat Jabatan
              </label>
            </div>

            {addRiwayatJabatan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-neutral-700 p-4 rounded-lg">
                <div>
                  <label htmlFor="jabatanLama" className="block text-sm font-medium text-slate-700 mb-1">
                    Jabatan Lama (Sebelum Kontrak)
                  </label>
                  <input
                    id="jabatanLama"
                    type="text"
                    value={jabatanLama || '-'}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Posisi pegawai sebelum kontrak baru ini (dari data pegawai)
                  </p>
                </div>
                <div>
                  <label htmlFor="jabatanBaru" className="block text-sm font-medium text-slate-700 mb-1">
                    Jabatan Baru (Di Kontrak) *
                  </label>
                  <input
                    id="jabatanBaru"
                    type="text"
                    value={jabatanBaru}
                    onChange={(e) => {
                      setJabatanBaru(e.target.value);
                      setValue('position', e.target.value);
                    }}
                    placeholder="Masukkan jabatan baru"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Posisi baru yang akan berlaku sejak kontrak ini dimulai (dapat diubah)
                  </p>
                </div>
                <div>
                  <label htmlFor="tanggalPerubahan" className="block text-sm font-medium text-slate-700 mb-1">
                    Tanggal Perubahan
                  </label>
                  <input
                    id="tanggalPerubahan"
                    type="date"
                    value={startDate || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-gray-100 dark:bg-neutral-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tanggal mulai kontrak (kapan perubahan jabatan berlaku)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
};

export default FormKontrak;