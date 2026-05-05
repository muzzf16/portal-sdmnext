import React, { useMemo, useState } from 'react';
import { ActivityLibraryItem } from '../types';
import { Jabatan } from '../../01-pegawai/api/jabatanApi';
import { useToast } from '@/app/providers/ToastContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import {
    useActivityLibraryList,
    useActivityPositions,
    useCreateActivityMutation,
    useDeleteActivityMutation,
    useJabatanListQuery,
    useUpdateActivityMutation
} from '../hooks/usePerformanceManagementQuery';

const ActivityLibraryPage: React.FC = () => {
    const [filterPosition, setFilterPosition] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<ActivityLibraryItem | null>(null);
    const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({});
    const { addToast } = useToast();
    const activityFilters = useMemo(
        () => (filterPosition ? { position: filterPosition } : undefined),
        [filterPosition]
    );
    const activityQuery = useActivityLibraryList(activityFilters);
    const positionsQuery = useActivityPositions();
    const jabatanQuery = useJabatanListQuery();
    const createActivityMutation = useCreateActivityMutation();
    const updateActivityMutation = useUpdateActivityMutation();
    const deleteActivityMutation = useDeleteActivityMutation();
    const activities = activityQuery.data ?? [];
    const jabatanList = (jabatanQuery.data ?? []) as Jabatan[];
    const positions = useMemo(
        () => ((positionsQuery.data ?? []).filter((p) => p !== 'Semua Jabatan')),
        [positionsQuery.data]
    );
    const loading = activityQuery.isLoading || positionsQuery.isLoading || jabatanQuery.isLoading;

    // Form state
    const [form, setForm] = useState<{
        position: string; department: string; activityName: string; durationMinutes: number | string; outputUnit: string; category: string;
        default_nominal?: number | string;
    }>({
        position: '', department: '', activityName: '', durationMinutes: '', outputUnit: '', category: '', default_nominal: ''
    });

    const resetForm = () => {
        setForm({ position: '', department: '', activityName: '', durationMinutes: '', outputUnit: '', category: '', default_nominal: '' });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleEdit = (item: ActivityLibraryItem) => {
        setEditingItem(item);
        setForm({
            position: item.position, department: item.department, activityName: item.activityName,
            durationMinutes: item.durationMinutes, outputUnit: item.outputUnit, category: item.category,
            default_nominal: item.default_nominal ?? ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                position: form.position,
                department: form.department,
                activityName: form.activityName,
                durationMinutes: Number(form.durationMinutes),
                outputUnit: form.outputUnit,
                category: form.category,
                default_nominal: form.default_nominal ? Number(form.default_nominal) : undefined
            };
            if (editingItem) {
                await updateActivityMutation.mutateAsync({ id: editingItem.id, data: payload });
                addToast('Aktivitas berhasil diupdate', 'success');
            } else {
                await createActivityMutation.mutateAsync(payload);
                addToast('Aktivitas berhasil ditambahkan', 'success');
            }
            resetForm();
        } catch (err) {
            addToast('Gagal menyimpan aktivitas', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus aktivitas ini?')) return;
        try {
            await deleteActivityMutation.mutateAsync(id);
            addToast('Aktivitas berhasil dihapus', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Gagal menghapus aktivitas', 'error');
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            operasional: 'bg-blue-100 text-blue-800',
            administrasi: 'bg-purple-100 text-purple-800',
            lapangan: 'bg-green-100 text-green-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const togglePosition = (position: string) => {
        setExpandedPositions(prev => ({
            ...prev,
            [position]: !prev[position]
        }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Perpustakaan Aktivitas</h1>
                    <p className="text-gray-600 mt-1">Master data durasi standar per jabatan — dasar perhitungan ABK & KPI</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <span>+</span> Tambah Aktivitas
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 flex gap-3 items-center">
                <label className="text-sm font-medium text-gray-700">Filter Jabatan:</label>
                <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Tampilkan Semua Jabatan</option>
                    <option value="Semua Jabatan">Khusus 'Semua Jabatan'</option>
                    {positions.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">{activities.length} aktivitas</span>
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={resetForm}
                title={editingItem ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
                size="lg"
            >
                <div className="mb-2">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posisi/Jabatan <span className="text-red-500">*</span></label>
                            <select
                                value={form.position}
                                onChange={e => {
                                    const selectedPos = e.target.value;
                                    if (selectedPos === 'Semua Jabatan') {
                                        setForm({ ...form, position: selectedPos, department: 'Semua Departemen' });
                                    } else {
                                        const jabatan = jabatanList.find(j => j.nama === selectedPos);
                                        setForm({ ...form, position: selectedPos, department: jabatan?.department || '' });
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                            >
                                <option value="">-- Pilih Posisi --</option>
                                <option value="Semua Jabatan">Semua Jabatan</option>
                                {jabatanList.map(j => (
                                    <option key={j.id} value={j.nama}>{j.nama}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Departemen <span className="text-red-500">*</span></label>
                            <input value={form.department} readOnly
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50 text-gray-500" placeholder="Auto-filled" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aktivitas *</label>
                            <input value={form.activityName} onChange={e => setForm({ ...form, activityName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required placeholder="e.g. Pembukaan rekening" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Standar (menit) *</label>
                            <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required min={0} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Output</label>
                            <input value={form.outputUnit} onChange={e => setForm({ ...form, outputUnit: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Nasabah, Dokumen" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="">Pilih...</option>
                                <option value="operasional">Operasional</option>
                                <option value="administrasi">Administrasi</option>
                                <option value="lapangan">Lapangan</option>
                            </select>
                        </div>
                        {form.outputUnit.toLowerCase().includes('nominal') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-600 font-bold">Default Target Nominal (Rp)</label>
                                <input type="number" value={form.default_nominal} onChange={e => setForm({ ...form, default_nominal: e.target.value })}
                                    className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm bg-blue-50 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 50000000" />
                                <p className="text-[10px] text-blue-500 mt-1">* Berlaku sebagai target standar jika tidak di-set per-pegawai</p>
                            </div>
                        )}
                        <div className="md:col-span-3 flex gap-2 justify-end mt-4 pt-4 border-t">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                {editingItem ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivitas</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durasi (menit)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(
                                activities.reduce((acc, obj) => {
                                    const key = obj.position || 'Lainnya';
                                    if (!acc[key]) acc[key] = [];
                                    acc[key].push(obj);
                                    return acc;
                                }, {} as Record<string, typeof activities>)
                            ).map(([position, acts]) => {
                                const isExpanded = expandedPositions[position] !== false; // Default to true if fully undefined

                                return (
                                    <React.Fragment key={position}>
                                        <tr className="bg-indigo-50/50 cursor-pointer hover:bg-indigo-50" onClick={() => togglePosition(position)}>
                                            <td colSpan={6} className="px-4 py-2 text-sm font-bold text-indigo-900 border-t border-b border-indigo-100">
                                                <div className="flex items-center">
                                                    {isExpanded ? <ChevronDown size={18} className="mr-2 text-indigo-500" /> : <ChevronRight size={18} className="mr-2 text-indigo-500" />}
                                                    {position} <span className="text-xs text-indigo-500 font-normal ml-2">({acts.length} aktivitas)</span>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && acts.map(act => (
                                            <tr key={act.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8 opacity-0 w-0 md:opacity-100 md:w-auto">{/* Hidden visual alignment */}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{act.activityName}</td>
                                                <td className="px-4 py-3 text-sm text-center font-mono">{act.durationMinutes}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{act.outputUnit}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(act.category)}`}>
                                                        {act.category || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    <button onClick={() => handleEdit(act)} className="text-blue-600 hover:text-blue-800 text-sm mr-3 font-medium">Edit</button>
                                                    <button onClick={() => handleDelete(act.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                )
                            })}
                            {activities.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Belum ada data aktivitas</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActivityLibraryPage;
