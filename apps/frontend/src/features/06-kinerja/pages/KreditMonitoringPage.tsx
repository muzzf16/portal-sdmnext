import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { getKreditMonitoring, processKreditStage, getWaNotificationLog, resendWaNotification } from '../api/kreditBerkasApi';
import { KreditBerkas, WANotificationLog } from '../types';
import { TrendingUp, PlayCircle, MessageSquare, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { KreditBerkasModal } from '../components/KreditBerkasModal';
import { useToast } from '../../../shared/hooks/useToast';
import clsx from 'clsx';
import { CreditWorkflowMap } from '../components/CreditWorkflowMap';

const KreditMonitoringPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [data, setData] = useState<KreditBerkas[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'dalam_proses' | 'dicairkan' | 'ditolak'>('all');
    
    // Selection state for Map
    const [selectedForMap, setSelectedForMap] = useState<KreditBerkas | undefined>(undefined);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedBerkas, setSelectedBerkas] = useState<KreditBerkas | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // WA Notification Logs States
    const [waLogs, setWaLogs] = useState<WANotificationLog[]>([]);
    const [loadingWaLogs, setLoadingWaLogs] = useState(false);
    const [isResendingWa, setIsResendingWa] = useState<number | null>(null);

    const fetchWaLogs = async (berkasId: number) => {
        setLoadingWaLogs(true);
        try {
            const res = await getWaNotificationLog(berkasId);
            setWaLogs(res.data.data || []);
        } catch (err: any) {
            console.error('Gagal memuat log WA:', err);
        } finally {
            setLoadingWaLogs(false);
        }
    };

    const handleResendWa = async (logId: number) => {
        setIsResendingWa(logId);
        try {
            const res = await resendWaNotification(logId);
            if (res.data.success) {
                addToast('Notifikasi WA berhasil dikirim ulang!', 'success');
                if (selectedForMap) {
                    fetchWaLogs(selectedForMap.id);
                }
            } else {
                addToast(res.data.message || 'Gagal mengirim ulang', 'error');
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Gagal mengirim ulang', 'error');
        } finally {
            setIsResendingWa(null);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getKreditMonitoring();
            setData(res.data.data || []);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data monitoring');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedForMap) {
            fetchWaLogs(selectedForMap.id);
        } else {
            setWaLogs([]);
        }
    }, [selectedForMap]);

    // Set default selected for map to first active berkas
    useEffect(() => {
        if (data.length > 0 && !selectedForMap) {
            const firstActive = data.find(d => d.overall_status === 'dalam_proses');
            if (firstActive) setSelectedForMap(firstActive);
        }
    }, [data, selectedForMap]);

    const { active, approved, rejected, avgDays } = useMemo(() => {
        let active = 0, approved = 0, rejected = 0;
        let totalDaysApproved = 0;

        data.forEach(item => {
            if (item.overall_status === 'dicairkan') {
                approved++;
                const created = new Date(item.created_at || '');
                const updated = new Date(item.updated_at || '');
                const days = (updated.getTime() - created.getTime()) / (1000 * 3600 * 24);
                totalDaysApproved += days;
            } else if (item.overall_status === 'ditolak') {
                rejected++;
            } else {
                active++;
            }
        });

        const avgDays = approved > 0 ? (totalDaysApproved / approved).toFixed(1) : '0';

        return { active, approved, rejected, avgDays };
    }, [data]);

    const filteredData = useMemo(() => {
        if (statusFilter === 'all') return data;
        return data.filter(d => d.overall_status === statusFilter);
    }, [data, statusFilter]);

    const getSlaInfo = (berkas: KreditBerkas) => {
        const start = new Date(berkas.created_at || '').getTime();
        const end = (berkas.overall_status === 'dicairkan' || berkas.overall_status === 'ditolak')
            ? new Date(berkas.updated_at || '').getTime()
            : new Date().getTime();
            
        const diffMs = Math.max(0, end - start);
        const diffDays = diffMs / (1000 * 3600 * 24);
        
        let color = 'bg-green-100 text-green-800 border-green-200';
        if (diffDays > 3 && diffDays <= 6) color = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (diffDays > 6) color = 'bg-red-100 text-red-800 border-red-200';
        
        const displayDays = diffDays < 0.1 && diffDays > 0 ? "0.1" : diffDays.toFixed(1);
        
        return { 
            days: displayDays, 
            color 
        };
    };

    const handleProcessClick = (e: React.MouseEvent, berkas: KreditBerkas) => {
        e.stopPropagation();
        setSelectedBerkas(berkas);
        setShowModal(true);
    };

    const handleRowClick = (berkas: KreditBerkas) => {
        setSelectedForMap(berkas);
    };

    const handleModalSubmit = async (formData: any) => {
        if (!selectedBerkas) return;
        
        setIsSubmitting(true);
        try {
            const res = await processKreditStage(selectedBerkas.id, formData);
            if (res.data.success) {
                addToast('Status berkas berhasil diperbarui', 'success');
                setShowModal(false);
                fetchData();
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Gagal memperbarui berkas', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProcess = (berkas: KreditBerkas) => {
        if (!berkas || berkas.overall_status !== 'dalam_proses') return false;
        
        const rawPos = (user as any)?.position || (user as any)?.employeeDetails?.position || '';
        const pos = (rawPos || '').toLowerCase();
        const stage = berkas.current_stage || '';
        const p = pos;
        
        // Admin can process anything
        if (user?.role === 'admin') return true;
        
        // 1. Penerimaan
        if (stage === 'penerimaan' && (p.includes('cs') || p.includes('customer service'))) return true;
        
        // 2. SLIK
        if (stage === 'slik' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // 3. Delegasi Survey
        if (stage === 'delegasi_survey' && p.includes('kabid kredit')) return true;
        
        // 4. OTS (Survey)
        if (stage === 'ots' && (p.includes('marketing') || p.includes('analis'))) return true;
        
        // 5. Komite Kredit
        if (stage === 'komite_kredit' && p.includes('kabid kredit')) return true;
        
        // 6. MAK & Agunan
        if (stage === 'mak_agunan' && (p.includes('marketing') || p.includes('analis'))) return true;
        
        // 7. Approval & Keputusan Final
        if (stage === 'approval_keputusan' && p.includes('kabid kredit')) return true;
        
        // 8. Admin SPK
        if (stage === 'admin_spk' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // 9. Pencairan
        if (stage === 'pencairan' && (p.includes('teller') || p.includes('kasir') || p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // Penanganan Tolak (CS)
        if (stage === 'ditolak_cs' && (p.includes('cs') || p.includes('customer service'))) return true;

        // Legacy support
        if (stage === 'analisa' && (p.includes('marketing') || p.includes('analis'))) return true;
        if (stage === 'verifikasi' && p.includes('kabid kredit')) return true;
        if (stage === 'admin_pencairan' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        return false;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <TrendingUp className="mr-3 h-7 w-7 text-indigo-600" />
                        Dashboard Monitoring Kredit
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Pantau status dan durasi (SLA) penyelesaian berkas pengajuan kredit secara real-time.
                    </p>
                </div>
                
                {/* Stats Summary (Condensed) */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Aktif</span>
                        <span className="text-lg font-black text-blue-700">{active}</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-green-400 uppercase">Cair</span>
                        <span className="text-lg font-black text-green-700">{approved}</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-red-400 uppercase">Tolak</span>
                        <span className="text-lg font-black text-red-700">{rejected}</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-2 bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">SLA</span>
                        <span className="text-lg font-black text-purple-700">{avgDays}d</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <CreditWorkflowMap data={data} selectedBerkas={selectedForMap} />

            <Card className="shadow-sm overflow-hidden border-gray-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">Daftar Berkas Pengajuan</h2>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm self-start sm:self-center">
                        {(['all', 'dalam_proses', 'dicairkan', 'ditolak'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize",
                                    statusFilter === s 
                                        ? "bg-indigo-600 text-white shadow-sm" 
                                        : "text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {s === 'all' ? 'Semua' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Nasabah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Tahap / Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Durasi (SLA)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                        Tidak ada berkas ditemukan untuk filter ini.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(berkas => {
                                    const sla = getSlaInfo(berkas);
                                    const userCanProcess = canProcess(berkas);
                                    const isSelected = selectedForMap?.id === berkas.id;
                                    
                                    return (
                                        <tr 
                                            key={berkas.id} 
                                            onClick={() => handleRowClick(berkas)}
                                            className={clsx(
                                                "hover:bg-indigo-50/30 transition-colors cursor-pointer",
                                                isSelected && "bg-indigo-50/50"
                                            )}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {berkas.created_at ? new Date(berkas.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{berkas.nama_pengajuan}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                Rp {(berkas.jumlah_pengajuan || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {berkas.current_stage === 'ditolak_cs' ? (
                                                        <Badge variant="danger" className="bg-red-600 hover:bg-red-700 text-white uppercase text-[9px] w-fit font-bold tracking-tight animate-pulse">
                                                            DITOLAK CS
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant={
                                                            berkas.overall_status === 'dicairkan' ? 'success' :
                                                            berkas.overall_status === 'ditolak' ? 'danger' : 'info'
                                                        } className="uppercase text-[9px] w-fit font-bold tracking-tight">
                                                            {(berkas.overall_status || '').replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                    <span className={clsx(
                                                        "text-[10px] font-medium",
                                                        berkas.current_stage === 'ditolak_cs' ? "text-red-600 font-bold" : "text-gray-400 italic"
                                                    )}>
                                                        Tahap: {(berkas.current_stage || '').replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={clsx("px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm", sla.color)}>
                                                    {sla.days} Hari
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {userCanProcess ? (
                                                    <Button 
                                                        size="xs" 
                                                        variant="primary"
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold py-1 px-3 shadow-sm"
                                                        onClick={(e) => handleProcessClick(e, berkas)}
                                                    >
                                                        <PlayCircle className="w-3 h-3 mr-1" />
                                                        Proses
                                                    </Button>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400">Read Only</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* WA Notification Logs Card */}
            {selectedForMap && (
                <Card className="shadow-sm overflow-hidden border-emerald-200 bg-emerald-50/10">
                    <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-emerald-950">
                                Riwayat Notifikasi WhatsApp — Nasabah: <span className="font-extrabold text-emerald-700">{selectedForMap.nama_pengajuan}</span> ({selectedForMap.no_wa_nasabah || 'Belum Ada No. WA'})
                            </h2>
                        </div>
                        <button
                            onClick={() => fetchWaLogs(selectedForMap.id)}
                            className="p-1 text-emerald-700 hover:text-emerald-900 transition-colors"
                            title="Refresh Log"
                            disabled={loadingWaLogs}
                        >
                            <RefreshCw className={clsx("h-4 w-4", loadingWaLogs && "animate-spin")} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {loadingWaLogs ? (
                            <div className="flex justify-center items-center py-6">
                                <RefreshCw className="animate-spin h-6 w-6 text-emerald-600" />
                            </div>
                        ) : waLogs.length === 0 ? (
                            <div className="text-center text-xs text-gray-500 py-6 italic">
                                Belum ada riwayat notifikasi WhatsApp untuk berkas ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-emerald-100 text-xs">
                                    <thead>
                                        <tr className="text-emerald-800 text-left font-bold uppercase tracking-wider bg-emerald-50/20">
                                            <th className="px-4 py-2">Tanggal & Waktu</th>
                                            <th className="px-4 py-2">Tahap / Trigger</th>
                                            <th className="px-4 py-2">No. WA</th>
                                            <th className="px-4 py-2">Isi Notifikasi</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                            <th className="px-4 py-2 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-100 bg-white">
                                        {waLogs.map((log) => {
                                            const triggerMap: Record<string, string> = {
                                                penerimaan: 'Penerimaan Berkas',
                                                delegasi_survey: 'Delegasi Survey',
                                                approval_keputusan: 'Keputusan (Disetujui)',
                                                ditolak: 'Ditolak'
                                            };
                                            return (
                                                <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-600">
                                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap font-bold text-emerald-800">
                                                        {triggerMap[log.trigger_stage] || log.trigger_stage}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-700">
                                                        {log.no_wa}
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs truncate text-gray-600 italic" title={log.message_content}>
                                                        {log.message_content}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <div className="flex justify-center">
                                                            {log.status === 'sent' ? (
                                                                <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Terkirim
                                                                </span>
                                                            ) : log.status === 'failed' ? (
                                                                <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200" title={log.error_message || undefined}>
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Gagal
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200 animate-pulse">
                                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        {log.status !== 'sent' && (
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                className="text-emerald-700 hover:text-emerald-900 border-emerald-300 hover:bg-emerald-50 px-2 py-0.5 text-[10px]"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleResendWa(log.id);
                                                                }}
                                                                disabled={isResendingWa === log.id}
                                                            >
                                                                {isResendingWa === log.id ? (
                                                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                                )}
                                                                Kirim Ulang
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <KreditBerkasModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                mode="process"
                berkas={selectedBerkas}
                isLoading={isSubmitting}
                titleOverride={selectedBerkas ? `Proses Berkas: ${selectedBerkas.nama_pengajuan}` : undefined}
            />
        </div>
    );
};

export default KreditMonitoringPage;
