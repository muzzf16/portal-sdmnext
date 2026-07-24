import React from 'react';
import { GraduationCap } from 'lucide-react';
import TambahPelatihanForm from '../components/TambahPelatihanForm';
import DaftarPelatihan from '../components/DaftarPelatihan';

const PelatihanSaya: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
          <GraduationCap className="mr-2 h-6 w-6 text-indigo-600" />
          Pelatihan Saya
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Daftar pelatihan yang diikuti dan unggah sertifikat bukti pelaksanaan.
        </p>
      </div>

      <TambahPelatihanForm />
      <DaftarPelatihan />
    </div>
  );
};

export default PelatihanSaya;