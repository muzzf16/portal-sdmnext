
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import PenggunaService from '@/shared/services/pengguna.service';

const ROLE_OPTIONS = ['employee', 'supervisor', 'admin'];
const ROLE_LABELS: Record<string, string> = {
  employee: 'Karyawan',
  supervisor: 'Supervisor',
  admin: 'Administrator',
};

export const UbahRole = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    PenggunaService.getAllPengguna().then((response) => {
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(data);
    });
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find((u) => u.id === e.target.value);
    setSelectedUser(user || null);
    setSelectedRole(user?.role || '');
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;
    setSaving(true);
    try {
      await PenggunaService.updatePengguna(selectedUser.id, { role: selectedRole });
      const response = await PenggunaService.getAllPengguna();
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(data);
      alert('Role berhasil diperbarui.');
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah role.');
    }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white";

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex flex-col items-center text-center">
        <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full mb-4">
          <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">Ubah Role Pengguna</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Mengubah peran dan hak akses pengguna
        </p>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          Ubah Role
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal}></div>
            <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ubah Role Pengguna</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ubah-role-user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pengguna</label>
                  <select id="ubah-role-user" onChange={handleUserChange} className={inputClass}>
                    <option value="">Pilih Pengguna</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({ROLE_LABELS[user.role] || user.role})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUser && (
                  <div>
                    <label htmlFor="ubah-role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Baru</label>
                    <select id="ubah-role-select" value={selectedRole} onChange={handleRoleChange} className={inputClass}>
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Role saat ini: <strong>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</strong>
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateRole}
                    disabled={!selectedUser || saving}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
