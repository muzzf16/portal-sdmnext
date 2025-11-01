import React, { useState } from 'react';
import { Table, Button } from '@/shared/components/ui';
import { useToast } from '@/app/providers/ToastContext';

interface CutiBersama {
  id: string;
  tanggal: string;
  deskripsi: string;
}

const KelolaJatahCuti: React.FC = () => {
  const { addToast } = useToast();
  const [jumlahJatahCuti, setJumlahJatahCuti] = useState<number>(18); // Default jatah cuti per tahun
  const [cutiBersama, setCutiBersama] = useState<CutiBersama[]>([
    { id: '1', tanggal: '2025-01-01', deskripsi: 'Tahun Baru' },
    { id: '2', tanggal: '2025-05-01', deskripsi: 'Hari Buruh Internasional' },
    { id: '3', tanggal: '2025-08-17', deskripsi: 'Hari Kemerdekaan RI' },
  ]);
  const [newCutiBersama, setNewCutiBersama] = useState({ tanggal: '', deskripsi: '' });

  const handleUpdateJatahCuti = () => {
    // Di sini akan disimpan ke backend
    addToast(`Jatah cuti tahunan diperbarui menjadi ${jumlahJatahCuti} hari`, 'success');
  };

  const handleAddCutiBersama = () => {
    if (!newCutiBersama.tanggal || !newCutiBersama.deskripsi) {
      addToast('Tanggal dan deskripsi harus diisi', 'error');
      return;
    }

    const newCuti: CutiBersama = {
      id: `cb-${Date.now()}`,
      tanggal: newCutiBersama.tanggal,
      deskripsi: newCutiBersama.deskripsi,
    };

    setCutiBersama([...cutiBersama, newCuti]);
    setNewCutiBersama({ tanggal: '', deskripsi: '' });
    addToast('Cuti bersama berhasil ditambahkan', 'success');
  };

  const handleDeleteCutiBersama = (id: string) => {
    setCutiBersama(cutiBersama.filter(cuti => cuti.id !== id));
    addToast('Cuti bersama berhasil dihapus', 'success');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold text-primary-dark-blue mb-4">Pengaturan Jatah Cuti Tahunan</h2>
      
      {/* Form untuk mengatur jatah cuti tahunan */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Jatah Cuti Tahunan (hari)</label>
          <input
            type="number"
            value={jumlahJatahCuti}
            onChange={(e) => setJumlahJatahCuti(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            min="0"
            max="365"
          />
        </div>
        <div className="md:col-span-2">
          <Button 
            variant="primary" 
            onClick={handleUpdateJatahCuti}
            className="w-full md:w-auto"
          >
            Simpan Jatah Cuti
          </Button>
        </div>
      </div>

      {/* Form untuk menambahkan cuti bersama */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Tambah Cuti Bersama</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Cuti Bersama</label>
            <input
              type="date"
              value={newCutiBersama.tanggal}
              onChange={(e) => setNewCutiBersama({...newCutiBersama, tanggal: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input
              type="text"
              value={newCutiBersama.deskripsi}
              onChange={(e) => setNewCutiBersama({...newCutiBersama, deskripsi: e.target.value})}
              placeholder="Contoh: Hari Raya Idul Fitri"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="success" 
              onClick={handleAddCutiBersama}
              className="w-full"
            >
              Tambah Cuti Bersama
            </Button>
          </div>
        </div>
      </div>

      {/* Daftar cuti bersama */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Daftar Cuti Bersama</h3>
        {cutiBersama.length > 0 ? (
          <Table headers={['Tanggal', 'Deskripsi', 'Aksi']}>
            {cutiBersama.map((cuti) => (
              <tr key={cuti.id}>
                <td className="py-3 px-4">{new Date(cuti.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="py-3 px-4">{cuti.deskripsi}</td>
                <td className="py-3 px-4">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteCutiBersama(cuti.id)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-gray-500">Belum ada cuti bersama yang ditambahkan.</p>
        )}
      </div>
    </div>
  );
};

export default KelolaJatahCuti;