import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePegawaiList, useDeletePegawai } from '../hooks/usePegawaiQuery';
import FormEditPegawai from './FormEditPegawai';
import { Eye, Edit3, Trash2, Search, Filter, User, ChevronDown } from 'lucide-react';
import { Table, Button, Badge } from '@/shared/components/ui';

const DaftarPegawai: React.FC = () => {
  const { data: pegawai, isLoading: loading, error, refetch: fetchPegawai } = usePegawaiList();
  const deleteMutation = useDeletePegawai();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEditId, setEmployeeToEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique positions and departments for filter dropdowns
  const positions = [...new Set(pegawai?.map(p => p.position).filter(Boolean) || [])];
  const departments = [...new Set(pegawai?.map(p => p.department).filter(Boolean) || [])];

  // Filter employees based on search term and filters
  const filteredPegawai = pegawai?.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = !filterPosition || p.position === filterPosition;
    const matchesDepartment = !filterDepartment || p.department === filterDepartment;
    const matchesStatus = !filterStatus ||
      (filterStatus === 'aktif' && p.isActive !== false) ||
      (filterStatus === 'nonaktif' && p.isActive === false);

    return matchesSearch && matchesPosition && matchesDepartment && matchesStatus;
  }) || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) {
      try {
        await deleteMutation.mutateAsync(id);
        // The mutation already handles updating the cache via React Query's invalidation in the hook
      } catch (err) {
        // Handle error
        alert('Gagal menghapus pegawai.');
        console.error('Error deleting pegawai:', err);
      }
    }
  };

  const openEditModal = (id: string) => {
    setEmployeeToEditId(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEmployeeToEditId(null);
    fetchPegawai(); // Refresh the list after edit
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPosition('');
    setFilterDepartment('');
    setFilterStatus('');
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['No', 'Foto', 'Nama', 'NIP', 'Jabatan', 'Departemen', 'Atasan', 'Status', 'Riwayat Jabatan', 'Aksi'];

  return (
    <div className="mt-6">
      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Daftar Pegawai</h2>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Cari berdasarkan nama atau NIP..."
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div>
              <label htmlFor="filter-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posisi</label>
              <select
                id="filter-position"
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                title="Pilih Posisi"
              >
                <option value="">Semua Posisi</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Kerja</label>
              <select
                id="filter-department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                title="Pilih Unit Kerja"
              >
                <option value="">Semua Unit</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                title="Pilih Status Pegawai"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Table */}
      {filteredPegawai.length > 0 ? (
        <Table headers={tableHeaders}>
          {filteredPegawai.map((p, index) => (
            <tr key={p.id}>
              <td className="py-4 px-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {index + 1}
              </td>
              <td className="py-4 px-6">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-4 px-6">{p.name}</td>
              <td className="py-4 px-6">{p.nip}</td>
              <td className="py-4 px-6">
                <div className="font-medium text-gray-900 dark:text-white">{(p as any).jabatanNama || p.position || '-'}</div>
                {(p as any).jabatanLevel && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Level {(p as any).jabatanLevel}</span>
                )}
              </td>
              <td className="py-4 px-6">{(p as any).jabatanDepartment || p.department || '-'}</td>
              <td className="py-4 px-6">
                {(p as any).atasanNama ? (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{(p as any).atasanNama}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
              <td className="py-4 px-6">
                <Badge variant={p.isActive === false ? 'danger' : 'success'}>
                  {p.isActive === false ? 'Nonaktif' : 'Aktif'}
                </Badge>
              </td>
              <td className="py-4 px-6 text-center">
                <Link
                  to={`/dashboard/pegawai/${p.id}/riwayat-jabatan`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Lihat Riwayat Jabatan"
                >
                  Lihat
                </Link>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/dashboard/pegawai/${p.id}`}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Lihat"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => openEditModal(String(p.id))}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-12 text-center">
          <User className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Tidak ada data pegawai</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pegawai?.length === 0
              ? 'Belum ada pegawai yang terdaftar.'
              : 'Tidak ada pegawai yang sesuai dengan filter pencarian.'}
          </p>
          <Button
            onClick={clearFilters}
            variant="primary"
            className="mt-4"
          >
            Reset Filter
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && employeeToEditId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <FormEditPegawai
              employeeId={employeeToEditId}
              onSuccess={closeEditModal}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarPegawai;
