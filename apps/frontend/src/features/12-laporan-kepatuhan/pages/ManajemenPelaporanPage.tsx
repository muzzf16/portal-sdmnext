import React, { useState, useRef } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Shield, Plus, Upload, Download, Edit2, Trash2, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAllLaporan, useCreateLaporan, useUpdateLaporan, useDeleteLaporan, useUploadExcelLaporan } from '../hooks/useLaporanKepatuhan';
import { usePegawaiList } from '@/features/01-pegawai/hooks/usePegawaiList';
import { CreateLaporanKepatuhanPayload, LaporanKepatuhanItem } from '../types';

export const ManajemenPelaporanPage: React.FC = () => {
  const { data: laporan = [], isLoading } = useAllLaporan();
  const { pegawai = [] } = usePegawaiList();
  
  const createMutation = useCreateLaporan();
  const updateMutation = useUpdateLaporan();
  const deleteMutation = useDeleteLaporan();
  const uploadMutation = useUploadExcelLaporan();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLaporanKepatuhanPayload>({
    nama_laporan: '',
    ketentuan: '',
    periode: '',
    tata_cara: '',
    batas_akhir: '',
    bagian: '',
    employee_id: '',
  });

  const summary = {
    total: laporan.length,
    completed: laporan.filter(l => l.status === 'completed').length,
    pending: laporan.filter(l => l.status === 'pending').length,
    overdue: laporan.filter(l => l.status === 'pending' && new Date(l.batas_akhir) < new Date()).length
  };

  const handleOpenModal = (item?: LaporanKepatuhanItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nama_laporan: item.nama_laporan,
        ketentuan: item.ketentuan || '',
        periode: item.periode || '',
        tata_cara: item.tata_cara || '',
        batas_akhir: item.batas_akhir.substring(0, 10), // Assuming ISO string YYYY-MM-DD
        bagian: item.bagian || '',
        employee_id: item.employee_id || '',
        status: item.status
      });
    } else {
      setEditingId(null);
      setFormData({
        nama_laporan: '',
        ketentuan: '',
        periode: '',
        tata_cara: '',
        batas_akhir: '',
        bagian: '',
        employee_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Yakin ingin menghapus laporan ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file, {
        onSuccess: () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-indigo-600" />
            Manajemen Laporan Kepatuhan
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Kelola jadwal pelaporan OJK, Pajak, BPJS, dan laporan eksternal lainnya.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} loading={uploadMutation.isPending}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={() => window.open('/api/laporan-kepatuhan/template', '_blank')}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Manual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <p className="text-sm text-neutral-500 font-medium">Total Laporan</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.total}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-neutral-500 font-medium">Selesai</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.completed}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-neutral-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.pending}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-neutral-500 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{summary.overdue}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Laporan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Batas Akhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">PIC / Bagian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">Memuat data...</td>
                </tr>
              ) : laporan.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">Belum ada data laporan</td>
                </tr>
              ) : (
                laporan.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        {item.nama_laporan}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 truncate max-w-xs">{item.ketentuan}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {item.periode || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        {new Date(item.batas_akhir).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">{item.employee_name || '-'}</div>
                      <div className="text-xs text-neutral-500">{item.bagian || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'completed' ? (
                        <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Selesai</Badge>
                      ) : new Date(item.batas_akhir) < new Date() ? (
                        <Badge variant="danger"><Clock className="w-3 h-3 mr-1" /> Overdue</Badge>
                      ) : (
                        <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingId ? 'Edit Laporan' : 'Tambah Laporan Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Laporan *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.nama_laporan}
                    onChange={e => setFormData({...formData, nama_laporan: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Periode</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bulanan (Maret)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.periode}
                    onChange={e => setFormData({...formData, periode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Batas Akhir (Deadline) *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.batas_akhir}
                    onChange={e => setFormData({...formData, batas_akhir: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">PIC (Pegawai)</label>
                  <select
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.employee_id || ''}
                    onChange={e => setFormData({...formData, employee_id: e.target.value})}
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {pegawai.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bagian/Unit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.bagian}
                    onChange={e => setFormData({...formData, bagian: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ketentuan Dasar</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.ketentuan}
                    onChange={e => setFormData({...formData, ketentuan: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tata Cara / Keterangan</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.tata_cara}
                    onChange={e => setFormData({...formData, tata_cara: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenPelaporanPage;
