import React, { useState } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { Calendar, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { HolidayData } from '@/shared/services/holidays.service';

export const ManajemenLibur: React.FC = () => {
  const { holidays, loading, error, addHoliday, editHoliday, removeHoliday } = useHolidays();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ tanggal: '', deskripsi: '' });
  const [actionError, setActionError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ tanggal: '', deskripsi: '' });
    setIsAdding(false);
    setEditingId(null);
    setActionError(null);
  };

  const handleAdd = async () => {
    setActionError(null);
    if (!formData.tanggal || !formData.deskripsi) {
      setActionError('Tanggal dan deskripsi wajib diisi');
      return;
    }
    const res = await addHoliday(formData);
    if (res.success) {
      resetForm();
    } else {
      setActionError(res.message || 'Gagal menambahkan libur');
    }
  };

  const handleEdit = async (id: string) => {
    setActionError(null);
    if (!formData.tanggal || !formData.deskripsi) {
      setActionError('Tanggal dan deskripsi wajib diisi');
      return;
    }
    const res = await editHoliday(id, formData);
    if (res.success) {
      resetForm();
    } else {
      setActionError(res.message || 'Gagal mengubah libur');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus hari libur ini?')) {
      const res = await removeHoliday(id);
      if (!res.success) {
        alert(res.message || 'Gagal menghapus libur');
      }
    }
  };

  const startEdit = (holiday: HolidayData) => {
    setFormData({ tanggal: holiday.tanggal, deskripsi: holiday.deskripsi });
    setEditingId(holiday.id);
    setIsAdding(false);
    setActionError(null);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading data libur...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
          Manajemen Hari Libur & Cuti Bersama
        </h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Hari Libur
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {actionError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{actionError}</div>}

      <div className="bg-white dark:bg-neutral-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deskripsi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
            {isAdding && (
              <tr className="bg-primary-50 dark:bg-primary-900/10">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Contoh: Tahun Baru 2026"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={handleAdd} className="text-green-600 hover:text-green-900 mr-3" title="Simpan">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" title="Batal">
                    <X className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            )}

            {holidays.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Belum ada data hari libur.
                </td>
              </tr>
            )}

            {holidays.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()).map((holiday) => (
              <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                {editingId === holiday.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(holiday.id)} className="text-green-600 hover:text-green-900 mr-3" title="Simpan">
                        <Check className="h-5 w-5" />
                      </button>
                      <button onClick={resetForm} className="text-gray-500 hover:text-gray-700" title="Batal">
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(holiday.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {holiday.deskripsi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => startEdit(holiday)} className="text-primary-600 hover:text-primary-900 mr-3" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(holiday.id)} className="text-red-600 hover:text-red-900" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
