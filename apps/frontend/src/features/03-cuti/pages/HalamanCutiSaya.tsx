import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { CalendarDays, Plus } from 'lucide-react';
import DaftarCutiSaya from '../components/DaftarCutiSaya';
import TambahCutiModal from '../components/TambahCutiModal';

const HalamanCutiSaya: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Cuti Saya
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Riwayat permohonan cuti dan pengajuan cuti baru.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Cuti
          </Button>
        </div>
      </div>

      <DaftarCutiSaya />

      {/* Modal Pengajuan Cuti */}
      <TambahCutiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HalamanCutiSaya;
