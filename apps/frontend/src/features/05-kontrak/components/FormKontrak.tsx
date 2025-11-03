import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Kontrak } from '../types';
import { buatKontrak, buatKontrakWithFile } from '../api/kontrakApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';

const FormKontrak: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Omit<Kontrak, 'id' | 'createdAt' | 'contractFile' | 'notes'> & { notes?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
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
          setFilteredEmployees(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  // Auto-fill position and department when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        setValue('position', selectedEmployee.position);
        setValue('department', selectedEmployee.department);
      }
    }
  }, [selectedEmployeeId, employees, setValue]);

  const contractTypes = ['permanent', 'temporary', 'contract'];
  const contractStatuses = ['active', 'expiring', 'expired', 'terminated'];

  const handleEmployeeSelect = (employeeId: string, position: string, department: string) => {
    setValue('employeeId', employeeId);
    setValue('position', position);
    setValue('department', department);
    setShowEmployeeDropdown(false);
    setSearchTerm('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: Omit<Kontrak, 'id' | 'createdAt' | 'contractFile' | 'notes'> & { notes?: string }) => {
    setIsSubmitting(true);
    
    // Validate that startDate < endDate
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      alert('Tanggal mulai harus lebih awal dari tanggal berakhir');
      setIsSubmitting(false);
      return;
    }

    try {
      // If there's a file to upload, use the file upload API
      if (documentFile) {
        // Prepare form data with file
        const formData = new FormData();
        
        // Add contract data (including terms and salary)
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'salary' && typeof value === 'number') {
              formData.append(key, value.toString());
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Add file
        formData.append('contractFile', documentFile);

        await buatKontrakWithFile(formData);
      } else {
        // Otherwise use the regular API
        await buatKontrak(data);
      }
      
      alert('Kontrak berhasil dibuat!');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal membuat kontrak.');
      console.error('Error creating kontrak:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Buat Kontrak Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee-search" className="block text-sm font-medium text-slate-700 mb-1">Pilih Pegawai</label>
            <div className="relative">
              <input
                id="employee-search"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                placeholder="Cari pegawai (nama, ID, atau NIP)"
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
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">Posisi</label>
            <input
              id="position"
              {...register('position', { required: 'Posisi wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
              readOnly
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
              {contractTypes.map(type => <option key={type} value={type}>{type}</option>)}
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
              {contractStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
          </div>
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-slate-700 mb-1">Gaji</label>
            <input
              id="salary"
              type="number"
              step="0.01"
              {...register('salary', { valueAsNumber: true })}
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
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Kontrak'}
        </button>
      </form>
    </div>
  );
};

export default FormKontrak;