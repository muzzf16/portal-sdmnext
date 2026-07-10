import React, { useState, useCallback } from 'react';
import DaftarKontrak from '../components/DaftarKontrak';
import FormKontrak from '../components/FormKontrak';
import { Plus, X } from 'lucide-react';

const HalamanKontrak: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContractCreated = useCallback(() => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark-blue dark:text-white">
          Manajemen Jabatan & Kontrak
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showForm ? (
            <>
              <X size={20} className="mr-2" />
              Tutup Form
            </>
          ) : (
            <>
              <Plus size={20} className="mr-2" />
              Tambah Kontrak
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <FormKontrak onSuccess={handleContractCreated} />
        </div>
      )}

      <DaftarKontrak key={refreshKey} />
    </div>
  );
};

export default HalamanKontrak;
