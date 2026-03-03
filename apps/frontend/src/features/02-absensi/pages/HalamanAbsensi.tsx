import React, { useState } from 'react';
import DaftarAbsensi from '../components/DaftarAbsensi';
import ExcelUpload from '../components/ExcelUpload';
import LogMachineUpload from '../components/LogMachineUpload';
import { Button } from '@/shared/components/ui';

const HalamanAbsensi: React.FC = () => {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Absensi & Kehadiran</h1>
          <p className="text-gray-500 mt-1">Kelola data absensi harian dan import log kehadiran.</p>
        </div>
        <Button
          variant={showImport ? 'outline' : 'primary'}
          onClick={() => setShowImport(!showImport)}
          className="mt-4 sm:mt-0"
        >
          {showImport ? 'Tutup Panel Import' : 'Import Data'}
        </Button>
      </div>

      {showImport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <LogMachineUpload />
          <ExcelUpload />
        </div>
      )}

      <DaftarAbsensi />
    </div>
  );
};

export default HalamanAbsensi;
