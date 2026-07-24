import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { GraduationCap, Plus, Printer } from 'lucide-react';
import { usePelatihan } from '../hooks/usePelatihan';
import TambahPelatihanModal from '../components/TambahPelatihanModal';
import DaftarPelatihan from '../components/DaftarPelatihan';
import { Pelatihan } from '@/shared/types/types';
import { deletePelatihan } from '../api/pelatihanApi';

export const HalamanPelatihan: React.FC = () => {
  const { pelatihan = [], refetch } = usePelatihan();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pelatihan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const filteredPelatihan = pelatihan.filter((item) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.nama_pelatihan?.toLowerCase().includes(q);
      const matchPeserta = (item.nama_peserta || item.employee_name || '').toLowerCase().includes(q);
      const matchOrg = item.penyelenggara?.toLowerCase().includes(q);
      match = match && (matchName || matchPeserta || matchOrg);
    }
    if (filterStartDate && item.tanggal_mulai) {
      match = match && item.tanggal_mulai >= filterStartDate;
    }
    if (filterEndDate && item.tanggal_selesai) {
      match = match && item.tanggal_selesai <= filterEndDate;
    }
    return match;
  });

  const summary = {
    total: pelatihan.length,
    withSertifikat: pelatihan.filter((p) => Boolean(p.nomor_sertifikat)).length,
    withSppd: pelatihan.filter((p) => Boolean(p.surat_jalan || p.sppd)).length,
    withSuratPenawaran: pelatihan.filter((p) => Boolean(p.surat_penawaran)).length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Pelatihan) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelatihan ini?')) {
      try {
        await deletePelatihan(id);
        refetch();
      } catch (err: any) {
        console.error('Error deleting pelatihan:', err);
        alert(err.response?.data?.message || 'Gagal menghapus data pelatihan');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Header for Window.print */}
      <div className="hidden print:block mb-6">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide text-black">PT BPR BAPERA BATANG</h1>
          <p className="text-xs text-gray-600">Jl. Jend. Sudirman No.72 Batang</p>
          <h2 className="text-lg font-bold mt-4 uppercase text-black">Daftar Seluruh Pelatihan Pegawai</h2>
        </div>
        <table className="w-full text-xs border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="border border-gray-300 p-2 text-left">No</th>
              <th className="border border-gray-300 p-2 text-left">Nama Pelatihan</th>
              <th className="border border-gray-300 p-2 text-left">Peserta</th>
              <th className="border border-gray-300 p-2 text-left">Penyelenggara</th>
              <th className="border border-gray-300 p-2 text-left">Tanggal Mulai</th>
              <th className="border border-gray-300 p-2 text-left">Tanggal Selesai</th>
              <th className="border border-gray-300 p-2 text-left">Surat Penawaran</th>
              <th className="border border-gray-300 p-2 text-left">SPPD</th>
              <th className="border border-gray-300 p-2 text-left">Sertifikat</th>
            </tr>
          </thead>
          <tbody>
            {filteredPelatihan.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                <td className="border border-gray-300 p-2 font-medium">{item.nama_pelatihan}</td>
                <td className="border border-gray-300 p-2">{item.nama_peserta || item.employee_name || '-'}</td>
                <td className="border border-gray-300 p-2">{item.penyelenggara}</td>
                <td className="border border-gray-300 p-2">{item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
                <td className="border border-gray-300 p-2">{item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</td>
                <td className="border border-gray-300 p-2 text-center">{item.surat_penawaran ? 'Ada' : '-'}</td>
                <td className="border border-gray-300 p-2 text-center">{item.surat_jalan || item.sppd ? 'Ada' : '-'}</td>
                <td className="border border-gray-300 p-2 text-center">{item.nomor_sertifikat ? 'Ada' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Screen view content */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
              <GraduationCap className="mr-2 h-6 w-6 text-indigo-600" />
              Manajemen Pelatihan
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Kelola data pelatihan, surat penawaran, SPPD, dan sertifikat pegawai.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
            <Button onClick={handleOpenAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pelatihan
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Cari Pelatihan / Peserta</label>
            <input
              type="text"
              placeholder="Ketik nama pelatihan or peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Mulai Dari</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Sampai Dengan</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
          >
            Reset
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-indigo-500">
            <p className="text-sm text-neutral-500 font-medium">Total Pelatihan</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.total}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-sm text-neutral-500 font-medium">Ada Surat Penawaran</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.withSuratPenawaran}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-sm text-neutral-500 font-medium">Ada SPPD</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.withSppd}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-sm text-neutral-500 font-medium">Ada Sertifikat</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.withSertifikat}</p>
          </Card>
        </div>

        {/* Table Component with Actions */}
        <DaftarPelatihan onEdit={handleEdit} onDelete={handleDelete} />

        {/* Modal */}
        <TambahPelatihanModal
          isOpen={isModalOpen}
          editingItem={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
};

export default HalamanPelatihan;
