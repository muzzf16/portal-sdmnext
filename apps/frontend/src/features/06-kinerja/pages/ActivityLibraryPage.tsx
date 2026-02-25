import React, { useState, useEffect } from 'react';
import { ActivityLibraryItem } from '../types';
import { getJabatanList, Jabatan } from '../../01-pegawai/api/jabatanApi';
import { getActivityLibrary, getActivityPositions, createActivity, updateActivity, deleteActivity } from '../api/activityLibraryApi';
import { useToast } from '@/app/providers/ToastContext';

const ActivityLibraryPage: React.FC = () => {
    const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);
    const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
    const [positions, setPositions] = useState<string[]>([]);
    const [filterPosition, setFilterPosition] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<ActivityLibraryItem | null>(null);
    const { addToast } = useToast();

    // Form state
    const [form, setForm] = useState({
        position: '', department: '', activityName: '', durationMinutes: 0, outputUnit: '', category: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const filters = filterPosition ? { position: filterPosition } : undefined;
            const res = await getActivityLibrary(filters);
            console.log("Activity Library Response Data:", res.data?.data);
            if (res.data?.data?.length > 0) {
                console.log("First item keys:", Object.keys(res.data.data[0]));
                console.log("First item id:", res.data.data[0].id, "type:", typeof res.data.data[0].id);
                const nullItems = res.data.data.filter((a: any) => !a.id);
                if (nullItems.length > 0) console.warn(`WARNING: ${nullItems.length} items have null/undefined id!`);
            }
            setActivities(res.data?.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchPositions = async () => {
        try {
            const [res, jabatanRes] = await Promise.all([
                getActivityPositions(),
                getJabatanList()
            ]);
            setPositions(res.data?.data || []);
            setJabatanList(jabatanRes || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    useEffect(() => { fetchData(); }, [filterPosition]);
    useEffect(() => { fetchPositions(); }, []);

    const resetForm = () => {
        setForm({ position: '', department: '', activityName: '', durationMinutes: 0, outputUnit: '', category: '' });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleEdit = (item: ActivityLibraryItem) => {
        setEditingItem(item);
        setForm({
            position: item.position, department: item.department, activityName: item.activityName,
            durationMinutes: item.durationMinutes, outputUnit: item.outputUnit, category: item.category
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateActivity(editingItem.id, form);
                addToast('Aktivitas berhasil diupdate', 'success');
            } else {
                await createActivity(form as any);
                addToast('Aktivitas berhasil ditambahkan', 'success');
            }
            resetForm();
            fetchData();
        } catch (err) {
            addToast('Gagal menyimpan aktivitas', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus aktivitas ini?')) return;
        try {
            await deleteActivity(id);
            addToast('Aktivitas berhasil dihapus', 'success');
            fetchData();
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
                    <option value="">Semua Jabatan</option>
                    {positions.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">{activities.length} aktivitas</span>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium mb-4">{editingItem ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posisi/Jabatan <span className="text-red-500">*</span></label>
                            <select
                                value={form.position}
                                onChange={e => {
                                    const selectedPos = e.target.value;
                                    const jabatan = jabatanList.find(j => j.nama === selectedPos);
                                    setForm({ ...form, position: selectedPos, department: jabatan?.department || '' });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                            >
                                <option value="">-- Pilih Posisi --</option>
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
                            <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
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
                        <div className="md:col-span-3 flex gap-2 justify-end">
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                {editingItem ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                            {activities.map(act => (
                                <tr key={act.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{act.position}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{act.activityName}</td>
                                    <td className="px-4 py-3 text-sm text-center font-mono">{act.durationMinutes}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{act.outputUnit}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(act.category)}`}>
                                            {act.category || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleEdit(act)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</button>
                                        <button onClick={() => handleDelete(act.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
                                    </td>
                                </tr>
                            ))}
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
