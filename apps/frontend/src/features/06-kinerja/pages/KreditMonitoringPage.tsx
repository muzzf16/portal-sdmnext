import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { getKreditMonitoring } from '../api/kreditBerkasApi';
import { KreditBerkas } from '../types';
import { Clock, FileText, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const KreditMonitoringPage: React.FC = () => {
    const [data, setData] = useState<KreditBerkas[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getKreditMonitoring();
                setData(res.data.data || []);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat data monitoring');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const activeBerkas = data.filter(d => d.overall_status === 'dalam_proses');

    const getSlaInfo = (createdAt: string) => {
        const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24));
        if (days <= 3) return { days, color: 'bg-green-100 text-green-800 border-green-200' };
        if (days <= 6) return { days, color: 'bg-amber-100 text-amber-800 border-amber-200' };
        return { days, color: 'bg-red-100 text-red-800 border-red-200 animate-pulse' };
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="mr-3 h-7 w-7 text-indigo-600" />
                    Dashboard Monitoring Kredit
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Pantau status dan durasi (SLA) penyelesaian berkas pengajuan kredit secara real-time.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full"><FileText className="w-6 h-6 text-blue-600"/></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Berkas Aktif</div>
                        <div className="text-2xl font-bold text-gray-900">{active}</div>
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="w-6 h-6 text-green-600"/></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Dicairkan</div>
                        <div className="text-2xl font-bold text-gray-900">{approved}</div>
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500 shadow-sm flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full"><XCircle className="w-6 h-6 text-red-600"/></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Ditolak</div>
                        <div className="text-2xl font-bold text-gray-900">{rejected}</div>
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-purple-500 shadow-sm flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full"><Clock className="w-6 h-6 text-purple-600"/></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Rata-rata SLA</div>
                        <div className="text-2xl font-bold text-gray-900">{avgDays} <span className="text-sm font-normal text-gray-500">hari</span></div>
                    </div>
                </Card>
            </div>

            <Card className="shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Daftar Berkas Dalam Proses</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pengajuan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Nasabah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahap Saat Ini</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi (SLA)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeBerkas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                                        Tidak ada berkas aktif saat ini.
                                    </td>
                                </tr>
                            ) : (
                                activeBerkas.map(berkas => {
                                    const sla = getSlaInfo(berkas.created_at || '');
                                    return (
                                        <tr key={berkas.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {berkas.nomor_pengajuan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{berkas.nama_pengajuan}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                Rp {berkas.jumlah_pengajuan.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="info" className="uppercase text-[10px]">
                                                    {berkas.current_stage.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={clsx("px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border", sla.color)}>
                                                    {sla.days} Hari
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default KreditMonitoringPage;
