import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Download, Search, Target } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { getKpiSummary } from '../api/kpiApi';
import { KpiSummaryRow } from '../types';
import { useCompanySettings } from '../../../shared/contexts/CompanySettingsContext';
import { useOnRefresh } from '@/shared/hooks/useDataRefresh';

interface KpiSummaryViewProps {
    isActive: boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getScoreLabel = (score: number) => {
    if (score >= 5) return 'Sangat Baik';
    if (score >= 4) return 'Baik';
    if (score >= 3) return 'Cukup';
    if (score >= 2) return 'Kurang';
    if (score >= 1) return 'Sangat Kurang';
    return '-';
};

const getStatusBadge = (status: KpiSummaryRow['statusSummary']) => {
    const statusMap = {
        empty: { label: 'Belum Ada KPI', className: 'bg-gray-100 text-gray-600' },
        draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
        waiting_approval: { label: 'Menunggu', className: 'bg-amber-100 text-amber-800' },
        active: { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
        completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
    };

    return statusMap[status];
};

const KpiSummaryView: React.FC<KpiSummaryViewProps> = ({ isActive }) => {
    const [summaries, setSummaries] = useState<KpiSummaryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<string>(getTodayString());
    const [endDate, setEndDate] = useState<string>(getTodayString());
    const { settings: companySettings } = useCompanySettings();

    const fetchSummary = async () => {
        if (!isActive) {
            return;
        }

        if (!startDate || !endDate) {
            setSummaries([]);
            setError('Pilih rentang tanggal terlebih dahulu.');
            return;
        }

        if (startDate > endDate) {
            setSummaries([]);
            setError('Tanggal akhir harus sama atau setelah tanggal mulai.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await getKpiSummary({ startDate, endDate });
            const rows = res.data?.data || [];
            setSummaries(Array.isArray(rows) ? rows : []);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Gagal memuat rekap KPI.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchSummary();
    }, [isActive, startDate, endDate]);

    useOnRefresh('kpi', () => {
        if (isActive) {
            void fetchSummary();
        }
    });

    const filteredSummaries = useMemo(() => {
        const normalizedSearch = searchQuery.toLowerCase();

        return [...summaries]
            .filter((summary) =>
                !normalizedSearch
                || summary.employeeName.toLowerCase().includes(normalizedSearch)
                || summary.department.toLowerCase().includes(normalizedSearch)
                || summary.position.toLowerCase().includes(normalizedSearch)
            )
            .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }, [searchQuery, summaries]);

    const handleExport = () => {
        if (filteredSummaries.length === 0) {
            alert('Tidak ada data rekap KPI untuk diexport');
            return;
        }

        const headerRows = [
            '"Rekap KPI Seluruh Karyawan"',
            `"${companySettings?.companyName || 'PT BPR BAPERA BATANG'}"`,
            `"Periode ${startDate} s/d ${endDate}"`,
            '',
        ];

        const columns = ['Karyawan', 'NIP', 'Departemen', 'Jabatan', 'Total KPI', 'Total Bobot (%)', 'Skor KPI (Tertimbang)', 'Status KPI'];
        const dataRows = filteredSummaries.map((summary) => {
            const statusBadge = getStatusBadge(summary.statusSummary);
            return `"${summary.employeeName}","${summary.nip}","${summary.department}","${summary.position}","${summary.totalKpi}","${summary.totalWeight}","${summary.weightedScore.toFixed(2)} / 5","${statusBadge.label}"`;
        });

        const csvContent = [...headerRows, columns.join(','), ...dataRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Rekap_KPI_${startDate}_to_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="hidden print:flex flex-col items-center justify-center text-center mb-8 relative">
                {companySettings?.logo && (
                    <img src={companySettings.logo} alt="Logo" className="absolute left-0 top-0 h-16 w-auto object-contain" />
                )}
                <h2 className="text-xl font-bold uppercase underline">Rekap KPI Seluruh Karyawan</h2>
                <h3 className="text-lg font-bold">{companySettings?.companyName || 'PT BPR BAPERA BATANG'}</h3>
                <p className="text-md font-bold">Periode {startDate} s/d {endDate}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Target className="mr-2 h-6 w-6 text-indigo-600" />
                        Rekap KPI Seluruh Karyawan
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitor rekap KPI karyawan berdasarkan rentang tanggal periode yang dipilih.
                    </p>
                </div>
            </div>

            <Card className="shadow-lg border-t-4 border-t-indigo-600 print:shadow-none print:border-none print:bg-transparent">
                <div className="p-6 print:p-0">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6 print:hidden">
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-4 py-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-40"
                                    />
                                </div>
                                <span className="text-gray-500">-</span>
                                <div className="relative flex-1 sm:flex-none">
                                    <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-4 py-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-40"
                                    />
                                </div>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau departemen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm" onClick={handleExport}>
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            <Button variant="outline" className="border-gray-300 text-indigo-700 hover:bg-indigo-50 bg-white shadow-sm" onClick={() => window.print()}>
                                Save to PDF / Print
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 p-4 rounded-md text-sm text-red-600 border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto print:overflow-visible rounded-lg border border-gray-200 print:border-none">
                        <table className="w-full text-sm text-left align-middle print:w-full print:table-fixed">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-6 py-4 border-b">Karyawan</th>
                                    <th className="px-6 py-4 border-b">Departemen / Jabatan</th>
                                    <th className="px-6 py-4 border-b text-center">Total KPI</th>
                                    <th className="px-6 py-4 border-b text-center">Total Bobot</th>
                                    <th className="px-6 py-4 border-b text-center">Skor KPI</th>
                                    <th className="px-6 py-4 border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></span>
                                                Memuat rekap KPI...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSummaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data KPI untuk tanggal terpilih atau pencarian tidak cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummaries.map((summary) => {
                                        const statusBadge = getStatusBadge(summary.statusSummary);

                                        return (
                                            <tr key={summary.employeeId} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{summary.employeeName}</div>
                                                    <div className="text-xs text-gray-500">NIP: {summary.nip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800">{summary.department || '-'}</div>
                                                    <div className="text-xs text-gray-500">{summary.position || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    {summary.totalKpi}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={clsx(
                                                        'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                                                        summary.totalWeight === 100 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                    )}>
                                                        {summary.totalWeight}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-semibold text-gray-900">{summary.weightedScore.toFixed(2)} / 5</span>
                                                    <div className="text-xs text-gray-500 mt-1">{getScoreLabel(summary.weightedScore)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={clsx('inline-flex px-2.5 py-1 rounded-full text-xs font-medium', statusBadge.className)}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default KpiSummaryView;
