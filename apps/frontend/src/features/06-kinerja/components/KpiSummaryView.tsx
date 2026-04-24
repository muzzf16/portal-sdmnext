import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Download, Search, Target } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useCompanySettings } from '../../../shared/contexts/CompanySettingsContext';
import { useKpiMonitoringSummary } from '../hooks/usePerformanceManagementQuery';

interface KpiSummaryViewProps {
    isActive: boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const EFFECTIVE_WORKING_MINUTES = 480;

const getWorkingDays = (start: string, end: string) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    let count = 0;
    let curDate = new Date(startDateObj.getTime());
    while (curDate <= endDateObj) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count > 0 ? count : 1;
};

const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: 'Sangat Baik', className: 'bg-green-100 text-green-800' };
    if (score >= 75) return { label: 'Baik', className: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { label: 'Cukup', className: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { label: 'Kurang', className: 'bg-orange-100 text-orange-800' };
    return { label: 'Sangat Kurang', className: 'bg-red-100 text-red-800' };
};

const KpiSummaryView: React.FC<KpiSummaryViewProps> = ({ isActive }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<string>(getTodayString());
    const [endDate, setEndDate] = useState<string>(getTodayString());
    const { settings: companySettings } = useCompanySettings();
    
    // Pass startDate/endDate as period filters
    const summaryQuery = useKpiMonitoringSummary(startDate, endDate, isActive && !!startDate && !!endDate && startDate <= endDate);
    const rawSummaries = (summaryQuery.data ?? []) as any[];
    const loading = summaryQuery.isLoading || summaryQuery.isFetching;
    const error = !startDate || !endDate
        ? 'Pilih rentang tanggal terlebih dahulu.'
        : startDate > endDate
            ? 'Tanggal akhir harus sama atau setelah tanggal mulai.'
            : ((summaryQuery.error as Error | null)?.message ?? null);

    const processedSummaries = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const effectiveEndDate = endDate && endDate > today ? today : endDate;
        const workingDays = startDate && effectiveEndDate ? getWorkingDays(startDate, effectiveEndDate) : 1;
        const targetMinutes = EFFECTIVE_WORKING_MINUTES * workingDays;

        return rawSummaries.map((summary) => {
            const totalDurasiMenit = summary.totalDurasiMenit || 0;
            const wlaPercentage = targetMinutes > 0 ? Math.min((totalDurasiMenit / targetMinutes) * 100, 100) : 0;

            const nplTargetFinal = summary.khusus.nplTarget >= 1000000 ? summary.khusus.nplTarget : 50000000;
            const kreditTargetFinal = summary.khusus.kreditTarget >= 1000000 ? summary.khusus.kreditTarget : 100000000;
            const danaTargetFinal = summary.khusus.danaTarget >= 1000000 ? summary.khusus.danaTarget : 100000000;

            const totalActual = summary.khusus.nplActual + summary.khusus.kreditActual + summary.khusus.danaActual;
            const totalTarget = nplTargetFinal + kreditTargetFinal + danaTargetFinal;

            let khususPercentage = 0;
            if (totalTarget > 0) {
                khususPercentage = Math.min((totalActual / totalTarget) * 100, 100);
            } else {
                khususPercentage = totalActual > 0 ? 100 : 0;
            }

            const finalTotal = (wlaPercentage * 0.8) + (khususPercentage * 0.2);

            return {
                ...summary,
                wlaPercentage,
                khususPercentage,
                finalTotal
            };
        });
    }, [rawSummaries, startDate, endDate]);

    const filteredSummaries = useMemo(() => {
        const normalizedSearch = searchQuery.toLowerCase();

        return [...processedSummaries]
            .filter((summary) =>
                !normalizedSearch
                || summary.employeeName.toLowerCase().includes(normalizedSearch)
                || summary.department.toLowerCase().includes(normalizedSearch)
                || summary.position.toLowerCase().includes(normalizedSearch)
            )
            .sort((a, b) => b.finalTotal - a.finalTotal || a.employeeName.localeCompare(b.employeeName));
    }, [searchQuery, processedSummaries]);

    const handleExport = () => {
        if (filteredSummaries.length === 0) {
            alert('Tidak ada data rekap KPI untuk diexport');
            return;
        }

        const headerRows = [
            '"Rekap Monitoring KPI Seluruh Karyawan"',
            `"${companySettings?.companyName || 'PT BPR BAPERA BATANG'}"`,
            `"Periode ${startDate} s/d ${endDate}"`,
            '',
        ];

        const columns = ['Nama Karyawan', 'Jabatan', 'Beban Kerja FTE (80%)', 'Pencapaian Khusus (20%)', 'Total Pencapaian / Skor'];
        const dataRows = filteredSummaries.map((summary) => {
            const scoreCategory = getScoreCategory(summary.finalTotal);
            return `"${summary.employeeName}","${summary.position}","${summary.wlaPercentage.toFixed(1)}%","${summary.khususPercentage.toFixed(1)}%","${summary.finalTotal.toFixed(1)}% (${scoreCategory.label})"`;
        });

        const csvContent = [...headerRows, columns.join(','), ...dataRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Rekap_Monitoring_KPI_${startDate}_to_${endDate}.csv`);
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
                <h2 className="text-xl font-bold uppercase underline">Rekap Monitoring KPI Seluruh Karyawan</h2>
                <h3 className="text-lg font-bold">{companySettings?.companyName || 'PT BPR BAPERA BATANG'}</h3>
                <p className="text-md font-bold">Periode {startDate} s/d {endDate}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Target className="mr-2 h-6 w-6 text-indigo-600" />
                        Rekap Monitoring KPI Seluruh Karyawan
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitor rekapan hasil monitoring KPI karyawan (WLA FTE &amp; KPI Khusus) berdasarkan rentang tanggal periode yang dipilih.
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
                                    <th className="px-6 py-4 border-b w-1/4">Nama Karyawan</th>
                                    <th className="px-6 py-4 border-b w-1/4">Jabatan</th>
                                    <th className="px-6 py-4 border-b text-center w-1/6">Beban Kerja FTE (80%)</th>
                                    <th className="px-6 py-4 border-b text-center w-1/6">Pencapaian Khusus (20%)</th>
                                    <th className="px-6 py-4 border-b text-center w-1/6">Total Pencapaian / Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></span>
                                                Memuat rekapan monitoring KPI...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSummaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data untuk tanggal terpilih atau pencarian tidak cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummaries.map((summary) => {
                                        const scoreCategory = getScoreCategory(summary.finalTotal);

                                        return (
                                            <tr key={summary.employeeId} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{summary.employeeName}</div>
                                                    <div className="text-xs text-gray-500">NIP: {summary.nip || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800">{summary.position || '-'}</div>
                                                    <div className="text-xs text-gray-500">{summary.department || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    <span className={clsx(
                                                        'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                                                        summary.wlaPercentage >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                    )}>
                                                        {summary.wlaPercentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={clsx(
                                                        'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                                                        summary.khususPercentage >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    )}>
                                                        {summary.khususPercentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-bold text-gray-900 text-lg">{summary.finalTotal.toFixed(1)}%</div>
                                                    <div className="mt-1">
                                                        <span className={clsx('inline-flex px-2.5 py-1 rounded-full text-xs font-medium border', scoreCategory.className)}>
                                                            {scoreCategory.label}
                                                        </span>
                                                    </div>
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
