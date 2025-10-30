import React, { useState } from 'react';
import DaftarPegawai from '../components/DaftarPegawai';
import FormPegawai from '../components/FormPegawai';
import clsx from 'clsx';
import { Plus, X } from 'lucide-react';

const HalamanPegawai: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-800 dark:text-primary-200 font-serif">
          Master Data Pegawai
        </h1>
        <button
          onClick={openModal}
          className={clsx(
            "px-4 py-2 font-bold text-white rounded-md transition-colors flex items-center",
            "bg-primary-700 hover:bg-primary-800",
            "dark:bg-primary-600 dark:hover:bg-primary-700"
          )}
        >
          <Plus className="mr-2" size={18} />
          Tambah Pegawai
        </button>
      </div>
      <DaftarPegawai />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white font-serif">Form Tambah Pegawai</h2>
            <FormPegawai />
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className={clsx(
                  "px-4 py-2 font-bold text-white rounded-md transition-colors flex items-center",
                  "bg-red-600 hover:bg-red-700",
                  "dark:bg-red-700 dark:hover:bg-red-800"
                )}
              >
                <X className="mr-2" size={18} />
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanPegawai;
