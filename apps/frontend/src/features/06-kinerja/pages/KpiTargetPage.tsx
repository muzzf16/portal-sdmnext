import React, { useState, useEffect } from 'react';
import { KpiTarget } from '../types';
import { getKpiTargets, createKpiTarget, updateActualValue, deleteKpiTarget, generateKpiFromAbk } from '../api/kpiApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { useToast } from '@/app/providers/ToastContext';

const KpiTargetPage: React.FC = () => {
    const [kpis, setKpis] = useState<KpiTarget[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useToast();

    // Form state
    const [form, setForm] = useState({
        employeeId: '', period: '', kpiName: '', targetValue: 0, targetUnit: '%', weight: 0, notes: ''
    });

    const fetchKpis = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (selectedEmployee) filters.employeeId = selectedEmployee;
            if (selectedPeriod) filters.period = selectedPeriod;
            const res = await getKpiTargets(filters);
            setKpis(res.data?.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await getPegawai();
                if (res.data && Array.isArray(res.data)) setEmployees(res.data);
            } catch (err) { console.error(err); }
        };
        fetchEmployees();
    }, []);

    useEffect(() => { fetchKpis(); }, [selectedEmployee, selectedPeriod]);

    const handleCreateKpi = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createKpiTarget(form as any);
            addToast('KPI target berhasil dibuat', 'success');
            setShowForm(false);
            setForm({ employeeId: '', period: '', kpiName: '', targetValue: 0, targetUnit: '%', weight: 0, notes: '' });
            fetchKpis();
        } catch (err) {
            addToast('Gagal membuat KPI target', 'error');
        }
    };

    const handleUpdateActual = async (kpi: KpiTarget) => {
        const value = prompt(`Masukkan realisasi untuk "${kpi.kpiName}" (target: ${kpi.targetValue} ${kpi.targetUnit}):`, String(kpi.actualValue || 0));
        if (value === null) return;
        try {
            await updateActualValue(kpi.id, parseFloat(value));
            addToast('Realisasi berhasil diupdate — skor dihitung otomatis', 'success');
            fetchKpis();
        } catch (err) {
            addToast('Gagal update realisasi', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus KPI target ini?')) return;
        try {
            await deleteKpiTarget(id);
            addToast('KPI target dihapus', 'success');
            fetchKpis();
        } catch (err) {
            addToast('Gagal menghapus KPI target', 'error');
        }
    };

    const handleGenerateFromAbk = async () => {
        if (!selectedEmployee) {
            addToast('Pilih pegawai terlebih dahulu', 'error');
            return;
        }
        const period = prompt('Masukkan periode KPI (e.g. 2026-S1):', `${new Date().getFullYear()}-S1`);
        if (!period) return;
        try {
            await generateKpiFromAbk(selectedEmployee, new Date().getFullYear(), period);
            addToast('KPI berhasil digenerate dari data ABK!', 'success');
            setSelectedPeriod(period);
            fetchKpis();
        } catch (err: any) {
            addToast(err?.response?.data?.message || 'Gagal generate KPI dari ABK', 'error');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 4) return 'text-green-600 bg-green-50';
        if (score >= 3) return 'text-yellow-600 bg-yellow-50';
        if (score >= 2) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 5) return 'Sangat Baik';
        if (score >= 4) return 'Baik';
        if (score >= 3) return 'Cukup';
        if (score >= 2) return 'Kurang';
        if (score >= 1) return 'Sangat Kurang';
        return '-';
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Calculate summary
    const totalWeight = kpis.reduce((sum, k) => sum + (k.weight || 0), 0);
    const weightedScore = totalWeight > 0
        ? kpis.reduce((sum, k) => sum + (k.score || 0) * (k.weight || 0), 0) / totalWeight
        : 0;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen KPI</h1>
                    <p className="text-gray-600 mt-1">Setting target KPI, monitoring realisasi, dan scoring otomatis</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleGenerateFromAbk}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                        ⚡ Generate dari ABK
                    </button>
                    <button onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        + Tambah KPI Target
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Pegawai:</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">Semua</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.nip})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Periode:</label>
                    <input type="text" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                        placeholder="e.g. 2026-S1" className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32" />
                </div>
            </div>

            {/* Summary Card */}
            {kpis.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex gap-8 items-center">
                        <div>
                            <span className="text-sm text-gray-600">Total KPI</span>
                            <p className="text-2xl font-bold text-gray-900">{kpis.length}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Total Bobot</span>
                            <p className="text-2xl font-bold text-gray-900">{totalWeight}%</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Skor Rata-rata (Tertimbang)</span>
                            <p className={`text-2xl font-bold ${weightedScore >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                                {weightedScore.toFixed(2)} / 5 — {getScoreLabel(weightedScore)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium mb-4">Tambah KPI Target</h3>
                    <form onSubmit={handleCreateKpi} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pegawai *</label>
                            <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required>
                                <option value="">Pilih Pegawai</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periode *</label>
                            <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required placeholder="e.g. 2026-S1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama KPI *</label>
                            <input value={form.kpiName} onChange={e => setForm({ ...form, kpiName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required placeholder="e.g. Akurasi Closing" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target *</label>
                            <input type="number" step="0.01" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Target</label>
                            <select value={form.targetUnit} onChange={e => setForm({ ...form, targetUnit: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="%">%</option>
                                <option value="hari">Hari</option>
                                <option value="jumlah">Jumlah</option>
                                <option value="menit">Menit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bobot (%)</label>
                            <input type="number" min={0} max={100} value={form.weight} onChange={e => setForm({ ...form, weight: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Opsional" />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Simpan</button>
                        </div>
                    </form>
                </div>
            )}

            {/* KPI Table */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Realisasi</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Skor</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bobot</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sumber</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {kpis.map(kpi => (
                                <tr key={kpi.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{kpi.kpiName}</div>
                                        {kpi.notes && <div className="text-xs text-gray-500 mt-1">{kpi.notes}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-mono">{kpi.targetValue} {kpi.targetUnit}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleUpdateActual(kpi)}
                                            className="font-mono text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                            {kpi.actualValue || 0} {kpi.targetUnit}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${getScoreColor(kpi.score)}`}>
                                            {kpi.score || '-'}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-0.5">{getScoreLabel(kpi.score)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-mono">{kpi.weight}%</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(kpi.status)}`}>
                                            {kpi.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{kpi.source === 'abk' ? '📊 ABK' : '✏️ Manual'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleDelete(kpi.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {kpis.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Belum ada KPI target. Buat manual atau generate dari ABK.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default KpiTargetPage;
