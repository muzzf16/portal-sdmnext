
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import PenggunaService from '@/shared/services/pengguna.service';

export const UbahRole = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    PenggunaService.getAllPengguna().then((response) => {
      setUsers(response.data);
    });
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find((user) => user.id === e.target.value);
    setSelectedUser(user);
    setSelectedRole(user.role);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleUpdateRole = () => {
    if (selectedUser) {
      PenggunaService.updatePengguna(selectedUser.id, { role: selectedRole }).then(() => {
        PenggunaService.getAllPengguna().then((response) => {
          setUsers(response.data);
        });
        closeModal();
      });
    }
  };

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
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Ubah Role Pengguna
                    </h3>
                    <div className="mt-2">
                      <form className="space-y-4">
                        <div>
                          <label htmlFor="user" className="block text-sm font-medium text-gray-700">Pengguna</label>
                          <select id="user" name="user" onChange={handleUserChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">Pilih Pengguna</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                          <select id="role" name="role" value={selectedRole} onChange={handleRoleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option>Employee</option>
                            <option>Administrator</option>
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleUpdateRole}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


