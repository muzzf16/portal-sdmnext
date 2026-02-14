import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus, Search, Edit2, Trash2, X, User, Briefcase, Loader2, Filter, ChevronDown, Download
} from 'lucide-react';
import { getKandidat, buatKandidat, perbaruiKandidat, hapusKandidat } from '../api/perekrutanApi';
import { getJabatanList, Jabatan } from '../../01-pegawai/api/jabatanApi';
import { Kandidat } from '../types';
import { Button, Card } from '@/shared/components/ui';

const STATUS_OPTIONS = [
  { value: 'Melamar', label: 'Melamar', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'Wawancara', label: 'Wawancara', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'Ditawarkan', label: 'Ditawarkan', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'Diterima', label: 'Diterima', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'Ditolak', label: 'Ditolak', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
];

const HalamanPerekrutan: React.FC = () => {
  const [candidates, setCandidates] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<Jabatan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Kandidat | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Kandidat>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesData, positionsData] = await Promise.all([
        getKandidat(),
        getJabatanList()
      ]);
      setCandidates(candidatesData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? candidate.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingCandidate) {
        await perbaruiKandidat(editingCandidate.id, data);
      } else {
        await buatKandidat(data);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Gagal menyimpan data kandidat');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) {
      try {
        await hapusKandidat(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Gagal menghapus kandidat');
      }
    }
  };

  const openModal = (candidate?: Kandidat) => {
    if (candidate) {
      setEditingCandidate(candidate);
      // Set form values
      Object.keys(candidate).forEach((key) => {
        setValue(key as any, (candidate as any)[key]);
      });
    } else {
      setEditingCandidate(null);
      reset({
        status: 'Melamar',
        application_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCandidate(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rekrutmen</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola lamaran dan proses seleksi karyawan baru</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={18} /> Tambah Kandidat
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </Card>

      {/* Candidate List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded-full mb-4">
              <User size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum ada kandidat</h3>
            <p className="max-w-sm mb-6">Mulai tambahkan kandidat baru atau sesuaikan filter pencarian Anda.</p>
            <Button variant="outline" onClick={() => openModal()}>Tambah Kandidat Baru</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kandidat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{candidate.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        {candidate.position_applied}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_OPTIONS.find(s => s.value === candidate.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(candidate.application_date || candidate.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {candidate.resume_url && (
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Download Resume"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => openModal(candidate)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Informasi Pribadi</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                    <input
                      {...register('name', { required: 'Nama wajib diisi' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      placeholder="Nama lengkap kandidat"
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email wajib diisi' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      placeholder="email@contoh.com"
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon</label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                {/* Application Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Informasi Lamaran</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posisi Dilamar</label>
                    <div className="relative">
                      <select
                        {...register('position_applied', { required: 'Posisi wajib dipilih' })}
                        className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      >
                        <option value="">Pilih Posisi</option>
                        {positions.map(pos => (
                          <option key={pos.id} value={pos.nama}>{pos.nama}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    {errors.position_applied && <span className="text-red-500 text-xs mt-1">{errors.position_applied.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <div className="relative">
                      <select
                        {...register('status')}
                        className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Melamar</label>
                    <input
                      type="date"
                      {...register('application_date')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 border-t border-gray-100 dark:border-neutral-700 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Resume / CV</label>
                  <input
                    {...register('resume_url')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    placeholder="Catatan interview atau feedback..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-700">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Kandidat'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanPerekrutan;
