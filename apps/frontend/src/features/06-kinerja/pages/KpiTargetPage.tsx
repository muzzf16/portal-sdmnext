import React, { useState, useEffect } from 'react';
import { KpiTarget } from '../types';
import { getKpiTargets, createKpiTarget, updateActualValue, deleteKpiTarget, generateKpiFromAbk, updateKpiTarget, syncKpiFromWla, getKpiTemplates, applyKpiTemplates } from '../api/kpiApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { useToast } from '@/app/providers/ToastContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Download, RefreshCw, Paperclip, X, FileText } from 'lucide-react';
import { emitRefresh, useOnRefresh } from '@/shared/hooks/useDataRefresh';

const KpiTargetPage: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role || 'employee'; // default to lowest privilege
    const [kpis, setKpis] = useState<KpiTarget[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { addToast } = useToast();

    // Realisasi modal state (Gap 5)
    const [actualModal, setActualModal] = useState<{ open: boolean; kpi: KpiTarget | null }>({ open: false, kpi: null });
    const [actualInput, setActualInput] = useState(0);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [actualSubmitting, setActualSubmitting] = useState(false);

    // Template modal state
    const [templateModal, setTemplateModal] = useState(false);
    const [templateDept, setTemplateDept] = useState('');
    const [templateDepts, setTemplateDepts] = useState<string[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [templateLoading, setTemplateLoading] = useState(false);

    // Form state
    const [form, setForm] = useState({
        employeeId: '', period: '', kpiName: '', targetValue: 0 as number | string, targetUnit: '%', weight: 0 as number | string, notes: '', category: 'outcome' as string
    });

    // Generate predefined period options
    const periodOptions = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [currentYear, currentYear + 1, currentYear + 2];
        const options: { value: string; label: string }[] = [];

        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        years.forEach(y => {
            // Semester
            options.push({ value: `${y}-S1`, label: `${y} - Semester 1 (Jan-Jun)` });
            options.push({ value: `${y}-S2`, label: `${y} - Semester 2 (Jul-Des)` });
            // Kuartal
            options.push({ value: `${y}-Q1`, label: `${y} - Kuartal 1 (Jan-Mar)` });
            options.push({ value: `${y}-Q2`, label: `${y} - Kuartal 2 (Apr-Jun)` });
            options.push({ value: `${y}-Q3`, label: `${y} - Kuartal 3 (Jul-Sep)` });
            options.push({ value: `${y}-Q4`, label: `${y} - Kuartal 4 (Okt-Des)` });
            // Bulanan
            monthNames.forEach((m, idx) => {
                const monthStr = String(idx + 1).padStart(2, '0');
                options.push({ value: `${y}-${monthStr}`, label: `${y} - ${m}` });
            });
        });
        return options;
    }, []);

    const fetchKpis = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            // If employee, force filter to own ID
            if (role === 'employee' && user?.employeeId) {
                filters.employeeId = user.employeeId;
            } else if (selectedEmployee) {
                filters.employeeId = selectedEmployee;
            }

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
            // If employee, just set self
            if (role === 'employee' && user?.employeeId) {
                setEmployees([{ id: user.employeeId, name: user.name, nip: user.employeeId }]);
                setSelectedEmployee(user.employeeId);
                return;
            }
            try {
                if (role === 'supervisor' && user?.employeeId) {
                    const res = await import('../../01-pegawai/api/jabatanApi').then(m => m.getSubordinates(String(user.employeeId), true));
                    if (Array.isArray(res)) setEmployees(res);
                } else {
                    const res = await getPegawai();
                    if (res.data && Array.isArray(res.data)) setEmployees(res.data);
                }
            } catch (err) { console.error(err); }
        };
        fetchEmployees();
    }, [role, user]);

    useEffect(() => { fetchKpis(); }, [selectedEmployee, selectedPeriod]);

    // Hot reload: refresh KPIs when WLA entries or ABK workload changes
    useOnRefresh(['wla-entry', 'workload'], () => fetchKpis());

    const handleCreateKpi = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateKpiTarget(editingId, form as any);
                addToast('KPI target berhasil diupdate', 'success');
            } else {
                await createKpiTarget(form as any);
                addToast('KPI target berhasil dibuat', 'success');
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ employeeId: '', period: '', kpiName: '', targetValue: 0 as number | string, targetUnit: '%', weight: 0 as number | string, notes: '', category: 'outcome' });
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast(err?.response?.data?.message || 'Gagal menyimpan KPI target', 'error');
        }
    };

    const handleEditClick = (kpi: KpiTarget) => {
        setForm({
            employeeId: kpi.employeeId,
            period: kpi.period,
            kpiName: kpi.kpiName,
            targetValue: kpi.targetValue,
            targetUnit: kpi.targetUnit || '%',
            weight: kpi.weight || 0,
            notes: kpi.notes || '',
            category: kpi.category || 'outcome'
        });
        setEditingId(kpi.id);
        setShowForm(true);
    };

    const handleUpdateActual = (kpi: KpiTarget) => {
        setActualModal({ open: true, kpi });
        setActualInput(kpi.actualValue || 0);
        setEvidenceFile(null);
    };

    const handleActualSubmit = async () => {
        if (!actualModal.kpi) return;
        setActualSubmitting(true);
        try {
            await updateActualValue(actualModal.kpi.id, actualInput, evidenceFile || undefined);
            addToast('Realisasi berhasil diupdate — skor dihitung otomatis', 'success');
            setActualModal({ open: false, kpi: null });
            setEvidenceFile(null);
            fetchKpis();
            emitRefresh('kpi');
        } catch (err) {
            addToast('Gagal update realisasi', 'error');
        }
        setActualSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus KPI target ini?')) return;
        try {
            await deleteKpiTarget(id);
            addToast('KPI target dihapus', 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err) {
            addToast('Gagal menghapus KPI target', 'error');
        }
    };

    const handleGenerateFromAbk = async () => {
        if (!selectedEmployee) {
            addToast('Pilih pegawai terlebih dahulu', 'error');
            return;
        }
        if (!selectedPeriod) {
            addToast('Pilih periode terlebih dahulu', 'error');
            return;
        }
        if (!confirm(`Generate KPI dari ABK untuk periode ${selectedPeriod}?`)) return;
        try {
            await generateKpiFromAbk(selectedEmployee, new Date().getFullYear(), selectedPeriod);
            addToast('KPI berhasil digenerate dari data ABK!', 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast(err?.response?.data?.message || 'Gagal generate KPI dari ABK', 'error');
        }
    };

    const handleSyncFromWla = async () => {
        if (!selectedEmployee) {
            addToast('Pilih pegawai terlebih dahulu', 'error');
            return;
        }
        if (!selectedPeriod) {
            addToast('Masukkan periode terlebih dahulu (e.g. 2026-S1)', 'error');
            return;
        }
        try {
            const res = await syncKpiFromWla(selectedEmployee, selectedPeriod);
            const data = res.data?.data || res.data;
            addToast(`Berhasil sync ${data.synced || 0} KPI dari rekap WLA (${data.startDate} s/d ${data.endDate})`, 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast(err?.response?.data?.message || 'Gagal sync realisasi dari WLA', 'error');
        }
    };

    // Template handlers
    const handleOpenTemplateModal = async () => {
        if (!selectedEmployee) {
            addToast('Pilih pegawai terlebih dahulu', 'error');
            return;
        }
        if (!selectedPeriod) {
            addToast('Pilih periode terlebih dahulu', 'error');
            return;
        }
        setTemplateModal(true);
        setTemplateLoading(true);
        try {
            const res = await getKpiTemplates();
            setTemplates(res.data?.data || []);
            setTemplateDepts(res.data?.departments || []);
            if (!templateDept && res.data?.departments?.length > 0) {
                setTemplateDept(res.data.departments[0]);
            }
        } catch (err) {
            addToast('Gagal memuat template KPI', 'error');
        }
        setTemplateLoading(false);
    };

    const handleApplyTemplate = async () => {
        if (!templateDept) {
            addToast('Pilih departemen template', 'error');
            return;
        }
        if (!confirm(`Apply template "${templateDept}" ke pegawai terpilih untuk periode ${selectedPeriod}?`)) return;
        try {
            const res = await applyKpiTemplates({
                employeeId: selectedEmployee,
                period: selectedPeriod,
                department: templateDept,
            });
            const data = res.data?.data || res.data;
            addToast(`Berhasil: ${data.created} KPI dibuat, ${data.skipped} dilewati (sudah ada)`, 'success');
            setTemplateModal(false);
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast(err?.response?.data?.message || 'Gagal apply template', 'error');
        }
    };

    const filteredTemplates = templates.filter(t => t.department === templateDept);

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
            draft: 'bg-gray-100 text-gray-700',
            waiting_approval: 'bg-amber-100 text-amber-800',
            active: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            draft: 'Draft',
            waiting_approval: 'Menunggu',
            active: 'Aktif',
            completed: 'Selesai',
            cancelled: 'Batal',
        };
        return { className: colors[status] || 'bg-gray-100 text-gray-800', label: labels[status] || status };
    };

    // Calculate summary
    const totalWeight = kpis.reduce((sum, k) => sum + (k.weight || 0), 0);
    const weightedScore = totalWeight > 0
        ? kpis.reduce((sum, k) => sum + (k.score || 0) * (k.weight || 0), 0) / totalWeight
        : 0;

    // Approval workflow handlers (Gap 4)
    const handleSubmitForApproval = async (kpi: KpiTarget) => {
        try {
            await updateKpiTarget(kpi.id, { status: 'waiting_approval' } as any);
            addToast(`KPI "${kpi.kpiName}" diajukan untuk persetujuan`, 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast('Gagal mengajukan KPI', 'error');
        }
    };

    const handleApproveKpi = async (kpi: KpiTarget) => {
        try {
            await updateKpiTarget(kpi.id, { status: 'active' } as any);
            addToast(`KPI "${kpi.kpiName}" disetujui dan aktif`, 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast('Gagal menyetujui KPI', 'error');
        }
    };

    const handleCompleteKpi = async (kpi: KpiTarget) => {
        try {
            await updateKpiTarget(kpi.id, { status: 'completed' } as any);
            addToast(`KPI "${kpi.kpiName}" ditandai selesai`, 'success');
            fetchKpis();
            emitRefresh('kpi');
        } catch (err: any) {
            addToast('Gagal menyelesaikan KPI', 'error');
        }
    };

    const handleExport = () => {
        if (kpis.length === 0) {
            alert('Tidak ada data KPI untuk diexport');
            return;
        }

        const headers = ['Nama KPI', 'Pegawai', 'Periode', 'Target', 'Realisasi', 'Skor', 'Bobot (%)', 'Status', 'Sumber', 'Catatan'];
        const csvContent = [
            headers.join(','),
            ...kpis.map(kpi => {
                const emp = employees.find(e => e.id === kpi.employeeId);
                const empName = emp ? emp.name : kpi.employeeId;
                const target = `${kpi.targetValue} ${kpi.targetUnit}`;
                const realisasi = `${kpi.actualValue || 0} ${kpi.targetUnit}`;

                return `"${kpi.kpiName}","${empName}","${kpi.period}","${target}","${realisasi}","${kpi.score || 0}","${kpi.weight || 0}%","${kpi.status}","${kpi.category || 'process'}","${kpi.source}","${kpi.notes || ''}"`;
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Target_KPI_${selectedPeriod || 'Semua'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen KPI</h1>
                    <p className="text-gray-600 mt-1">Setting target KPI, monitoring realisasi, dan scoring otomatis</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                    {role !== 'employee' && (
                        <>
                            <button onClick={handleGenerateFromAbk}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                                ⚡ Generate dari ABK
                            </button>
                            <button onClick={handleOpenTemplateModal}
                                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Dari Template
                            </button>
                            <button onClick={handleSyncFromWla}
                                className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 text-sm flex items-center">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync Realisasi dari WLA
                            </button>
                            <button onClick={() => {
                                setEditingId(null);
                                setForm({ employeeId: selectedEmployee || '', period: selectedPeriod || '', kpiName: '', targetValue: 0 as number | string, targetUnit: '%', weight: 0 as number | string, notes: '', category: 'outcome' });
                                setShowForm(!showForm);
                            }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                + Tambah KPI Target
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Pegawai:</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        disabled={role === 'employee'}>
                        <option value="">Semua</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.nip})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Periode:</label>
                    <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">Semua Periode</option>
                        {periodOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
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
                    <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit KPI Target' : 'Tambah KPI Target'}</h3>
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
                            <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required>
                                <option value="">Pilih Periode</option>
                                {periodOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama KPI *</label>
                            <input value={form.kpiName} onChange={e => setForm({ ...form, kpiName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required placeholder="e.g. Akurasi Closing" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target *</label>
                            <input type="number" step="0.01" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value === '' ? '' : parseFloat(e.target.value) })}
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
                            <input type="number" min={0} max={100} value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori KPI</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="process">📊 Proses (otomatis dari WLA)</option>
                                <option value="outcome">🎯 Hasil / Outcome (manual)</option>
                                <option value="strategic">🏢 Strategis (cascading)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                {form.category === 'process' && 'Realisasi otomatis dari log aktivitas harian (WLA).'}
                                {form.category === 'outcome' && 'Realisasi diinput manual oleh atasan. Contoh: kepuasan pelanggan, NPL ratio.'}
                                {form.category === 'strategic' && 'Target cascading dari tujuan perusahaan. Contoh: revenue growth.'}
                            </p>
                        </div>
                        <div>
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
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
                                    <td className="px-4 py-3 text-center text-sm font-mono">{kpi.targetValue} {kpi.targetUnit === 'jumlah' ? '' : kpi.targetUnit}</td>
                                    <td className="px-4 py-3 text-center">
                                        {role !== 'employee' ? (
                                            <button onClick={() => handleUpdateActual(kpi)}
                                                className="font-mono text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                                {kpi.actualValue || 0} {kpi.targetUnit === 'jumlah' ? '' : kpi.targetUnit}
                                            </button>
                                        ) : (
                                            <span className="font-mono text-sm text-gray-700">
                                                {kpi.actualValue || 0} {kpi.targetUnit === 'jumlah' ? '' : kpi.targetUnit}
                                            </span>
                                        )}
                                        {kpi.evidenceUrl && (
                                            <a href={kpi.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex ml-1 text-green-600 hover:text-green-800" title="Lihat Bukti">
                                                <Paperclip className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${getScoreColor(kpi.score)}`}>
                                            {kpi.score || '-'}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-0.5">{getScoreLabel(kpi.score)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-mono">{kpi.weight}%</td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            const s = getStatusBadge(kpi.status); return (
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${s.className}`}>
                                                    {s.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${kpi.category === 'process' ? 'bg-blue-100 text-blue-800' :
                                            kpi.category === 'strategic' ? 'bg-purple-100 text-purple-800' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                            {kpi.category === 'process' ? '📊 Proses' : kpi.category === 'strategic' ? '🏢 Strategis' : '🎯 Outcome'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {role !== 'employee' && (
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                {kpi.status === 'draft' && (
                                                    <button onClick={() => handleSubmitForApproval(kpi)} className="text-amber-600 hover:text-amber-800 text-xs font-medium px-2 py-1 rounded border border-amber-300 hover:bg-amber-50">Ajukan</button>
                                                )}
                                                {kpi.status === 'waiting_approval' && (
                                                    <button onClick={() => handleApproveKpi(kpi)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium px-2 py-1 rounded border border-emerald-300 hover:bg-emerald-50">Aktifkan</button>
                                                )}
                                                {kpi.status === 'active' && (
                                                    <button onClick={() => handleCompleteKpi(kpi)} className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded border border-green-300 hover:bg-green-50">✓ Selesai</button>
                                                )}
                                                <button onClick={() => handleEditClick(kpi)} className="text-indigo-600 hover:text-indigo-800 text-xs px-2 py-1">Edit</button>
                                                <button onClick={() => handleDelete(kpi.id)} className="text-red-600 hover:text-red-800 text-xs px-2 py-1">Hapus</button>
                                            </div>
                                        )}
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
            {/* Realisasi + Evidence Modal (Gap 5) */}
            {actualModal.open && actualModal.kpi && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Update Realisasi</h3>
                            <button onClick={() => setActualModal({ open: false, kpi: null })} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">KPI: <span className="font-semibold text-gray-900">{actualModal.kpi.kpiName}</span></p>
                                <p className="text-xs text-gray-500">Target: {actualModal.kpi.targetValue} {actualModal.kpi.targetUnit === 'jumlah' ? '' : actualModal.kpi.targetUnit}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Realisasi ({actualModal.kpi.targetUnit === 'jumlah' ? 'Total' : actualModal.kpi.targetUnit})</label>
                                <input type="number" value={actualInput} onChange={e => setActualInput(parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                                    min={0} step="any" autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bukti / Evidence <span className="text-gray-400 font-normal">(opsional)</span></label>
                                {evidenceFile ? (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                        <Paperclip className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-800 truncate flex-1">{evidenceFile.name}</span>
                                        <button onClick={() => setEvidenceFile(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Pilih file (gambar/PDF/dokumen)</span>
                                        <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" onChange={e => setEvidenceFile(e.target.files?.[0] || null)} />
                                    </label>
                                )}
                                {actualModal.kpi.evidenceUrl && !evidenceFile && (
                                    <p className="text-xs text-gray-500 mt-1">📎 Bukti sebelumnya: <a href={actualModal.kpi.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Lihat</a></p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            <button onClick={() => setActualModal({ open: false, kpi: null })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Batal</button>
                            <button onClick={handleActualSubmit} disabled={actualSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                {actualSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {templateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">📋 Template KPI per Departemen</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Pilih departemen untuk apply template KPI ke pegawai & periode terpilih</p>
                            </div>
                            <button onClick={() => setTemplateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        {templateLoading ? (
                            <div className="p-8 text-center text-gray-500">Memuat template...</div>
                        ) : (
                            <>
                                {/* Department tabs */}
                                <div className="px-6 pt-4 flex gap-2 flex-wrap">
                                    {templateDepts.map(dept => (
                                        <button key={dept} onClick={() => setTemplateDept(dept)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${templateDept === dept
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}>
                                            {dept}
                                        </button>
                                    ))}
                                </div>

                                {/* Template preview table */}
                                <div className="px-6 py-4 flex-1 overflow-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama KPI</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Target</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Bobot</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pengukuran</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredTemplates.map((tpl: any) => (
                                                <tr key={tpl.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-gray-900">{tpl.kpiName}</div>
                                                        {tpl.description && <div className="text-xs text-gray-400 mt-0.5">{tpl.description}</div>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${tpl.category === 'process' ? 'bg-blue-100 text-blue-800' :
                                                            tpl.category === 'strategic' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {tpl.category === 'process' ? '📊 Proses' : tpl.category === 'strategic' ? '🏢 Strategis' : '🎯 Outcome'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-mono">{tpl.targetValue} {tpl.targetUnit === 'jumlah' ? '' : tpl.targetUnit}</td>
                                                    <td className="px-3 py-2 text-center font-semibold">{tpl.weight}%</td>
                                                    <td className="px-3 py-2 text-xs text-gray-500">{tpl.measureSource}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredTemplates.length > 0 && (
                                        <div className="mt-3 p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
                                            <strong>{filteredTemplates.length} KPI</strong> akan dibuat — Total bobot: <strong>{filteredTemplates.reduce((s: number, t: any) => s + t.weight, 0)}%</strong>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            <button onClick={() => setTemplateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Batal</button>
                            <button onClick={handleApplyTemplate} disabled={filteredTemplates.length === 0}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                                Apply {filteredTemplates.length} KPI ke Pegawai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KpiTargetPage;
