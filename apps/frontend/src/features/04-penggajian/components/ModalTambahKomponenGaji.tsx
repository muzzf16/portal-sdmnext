import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (komponen: { nama: string; jenis: 'tunjangan' | 'potongan'; jumlah: number }) => void;
  payrollId: string;
}

const ModalTambahKomponenGaji: React.FC<Props> = ({ isOpen, onClose, onSave, payrollId: _payrollId }) => {
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<'tunjangan' | 'potongan'>('tunjangan');
  const [jumlah, setJumlah] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nama, jenis, jumlah });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-1/3">
        <h2 className="text-2xl font-bold mb-4">Tambah Komponen Gaji</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nama Komponen</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Jenis</label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as 'tunjangan' | 'potongan')}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="tunjangan">Tunjangan</option>
              <option value="potongan">Potongan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Jumlah</label>
            <input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2">
              Batal
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahKomponenGaji;
