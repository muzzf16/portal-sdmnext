import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { CalendarDays, Plus } from 'lucide-react';
import DaftarCuti from '../components/DaftarCuti';
import KelolaJatahCuti from '../components/KelolaJatahCuti';
import PerhitunganSisaCuti from '../components/PerhitunganSisaCuti';
import TambahCutiModal from '../components/TambahCutiModal';
import type { Cuti } from '../types';

const HalamanCuti: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cuti | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Cuti) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Manajemen Cuti &amp; Izin
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Kelola permohonan cuti, persetujuan status, dan saldo sisa cuti pegawai.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Input Cuti
          </Button>
        </div>
      </div>

      {/* 1. Kartu Informasi Jatah Cuti Tahunan & Cuti Bersama (Atas) */}
      <KelolaJatahCuti />

      {/* 2. Tabel Daftar Pegawai yang Cuti (dengan Aksi Edit & Delete) */}
      <DaftarCuti onEdit={handleEdit} />

      {/* 3. Perhitungan Sisa Cuti Pegawai */}
      <PerhitunganSisaCuti />

      {/* Form Modal (Add & Edit) */}
      <TambahCutiModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
};

export default HalamanCuti;
