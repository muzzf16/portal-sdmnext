import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Download, Users, Search, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { getAdminLogAktivitasSummaryWla, getAdminDetailLogsWla, updateLogAktivitasStatusWla } from '../api/logAktivitasHarianApi';
import { getEmployees } from '../../../shared/services/employeeAPI';
import { AdminWlaSummary } from '../types';
import { useCompanySettings } from '../../../shared/contexts/CompanySettingsContext';
import clsx from 'clsx';

const AdminWlaSummaryPage: React.FC = () => {
    const [summaries, setSummaries] = useState<AdminWlaSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
    const [detailLogs, setDetailLogs] = useState<Record<string, any[]>>({});
    const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [directorNames, setDirectorNames] = useState({
        direkturUtama: 'Nama Lengkap & Tandatangan',
        direkturYmfk: 'Nama Lengkap & Tandatangan'
    });
    const { settings: companySettings } = useCompanySettings();

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminLogAktivitasSummaryWla(undefined, startDate, endDate);
            const fetchedData = res?.data?.data || [];
            setSummaries(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat rekap admin WLA.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
        setExpandedEmployee(null);
        setDetailLogs({});
    }, [startDate, endDate]);

    useEffect(() => {
        const fetchDirectors = async () => {
            try {
                const res = await getEmployees();
                const employees = (res.data || res || []) as any[];
                const dirUtama = employees.find((e) => e.position?.toLowerCase() === 'direktur utama' || e.jabatan?.toLowerCase() === 'direktur utama');
                const dirYmfk = employees.find((e) => e.position?.toLowerCase() === 'direktur ymfk' || e.jabatan?.toLowerCase() === 'direktur ymfk');

                setDirectorNames({
                    direkturUtama: dirUtama ? (dirUtama.name || dirUtama.nama_lengkap) : 'Nama Lengkap & Tandatangan',
                    direkturYmfk: dirYmfk ? (dirYmfk.name || dirYmfk.nama_lengkap) : 'Nama Lengkap & Tandatangan'
                });
            } catch (err) {
                console.error("Gagal mengambil data direktur:", err);
            }
        };
        fetchDirectors();
    }, []);

    const EFFECTIVE_WORKING_MINUTES = 480;

    // Helper to calculate total working days (Mon-Fri) between two dates
    const getWorkingDays = (start: string, end: string) => {
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        let count = 0;
        let curDate = new Date(startDateObj.getTime());
        while (curDate <= endDateObj) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Sun, 6=Sat
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        return count > 0 ? count : 1; // Fallback to 1 if same day weekend or invalid
    };

    const targetMinutes = EFFECTIVE_WORKING_MINUTES * getWorkingDays(startDate, endDate);

    const getFteStatus = (minutes: number) => {
        const percentage = (minutes / targetMinutes) * 100;
        if (percentage > 100) return { label: 'Overload', color: 'bg-red-100 text-red-800' };
        if (percentage >= 80) return { label: 'Optimal', color: 'bg-green-100 text-green-800' };
        return { label: 'Underload', color: 'bg-yellow-100 text-yellow-800' };
    };

    const filteredSummaries = summaries.filter(s =>
        (s.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.departemen || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        if (filteredSummaries.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const currentYear = new Date().getFullYear();
        const headerRows = [
            `"Rekap Harian Beban kerja Pegawai"`,
            `"PT BPR BAPERA BATANG"`,
            `"Periode ${startDate} s/d ${endDate} tahun ${currentYear}"`,
            ``
        ];

        const columns = ['Karyawan', 'NIP', 'Departemen', 'Jabatan', 'Aktivitas Dilog', 'Durasi Total (Menit)', 'Beban (FTE %)', 'Status'];

        const dataRows = filteredSummaries.map(s => {
            const durasi = s.total_durasi_menit || 0;
            const percent = Math.round((durasi / targetMinutes) * 100);
            const status = getFteStatus(durasi).label;
            return `"${s.nama_lengkap}","${s.nip}","${s.departemen}","${s.jabatan}","${s.jumlah_log}","${durasi}","${percent}%","${status}"`;
        });

        const csvContent = [...headerRows, columns.join(','), ...dataRows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Rekap_WLA_${startDate}_to_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleToggleExpand = async (s: AdminWlaSummary) => {
        const key = String(s.id_pegawai);
        if (expandedEmployee === key) {
            setExpandedEmployee(null);
            return;
        }
        setExpandedEmployee(key);
        if (!detailLogs[key]) {
            setDetailLoading(prev => ({ ...prev, [key]: true }));
            try {
                const res = await getAdminDetailLogsWla(key, undefined, startDate, endDate);
                setDetailLogs(prev => ({ ...prev, [key]: res?.data?.data || [] }));
            } catch {
                setDetailLogs(prev => ({ ...prev, [key]: [] }));
            } finally {
                setDetailLoading(prev => ({ ...prev, [key]: false }));
            }
        }
    };

    const handleUpdateStatus = async (logId: number, status: 'approved' | 'rejected', employeeKey: string) => {
        setUpdatingId(logId);
        try {
            await updateLogAktivitasStatusWla(logId, status);
            // Refresh detail logs for the employee
            const res = await getAdminDetailLogsWla(employeeKey, undefined, startDate, endDate);
            setDetailLogs(prev => ({ ...prev, [employeeKey]: res?.data?.data || [] }));
            // Also refresh the summary row so duration/FTE updates automatically
            await fetchSummary();
        } catch (err) {
            alert('Gagal mengubah status log.');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'approved') return 'bg-green-100 text-green-800';
        if (status === 'rejected') return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800'; // pending
    };

    return (
        <div className="space-y-6">
            {/* Print Only Header */}
            <div className="hidden print:flex flex-col items-center justify-center text-center mb-8 relative">
                {companySettings?.logo && (
                    <img src={companySettings.logo} alt="Logo" className="absolute left-0 top-0 h-16 w-auto object-contain" />
                )}
                <h2 className="text-xl font-bold uppercase underline">Rekap Harian Beban kerja Pegawai</h2>
                <h3 className="text-lg font-bold">PT BPR BAPERA BATANG</h3>
                <p className="text-md font-bold">Periode {startDate} s/d {endDate} tahun {new Date().getFullYear()}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-2 h-6 w-6 text-indigo-600" />
                        Rekap WLA Harian
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Monitor beban kerja aktual karyawan berdasarkan kalkulasi Norma Waktu harian.
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
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
                                    <th className="px-6 py-4 border-b text-center">Aktivitas Dilog</th>
                                    <th className="px-6 py-4 border-b text-center">Durasi Total</th>
                                    <th className="px-6 py-4 border-b text-center">Beban (FTE)</th>
                                    <th className="px-6 py-4 border-b text-center">Status</th>
                                    <th className="px-6 py-4 border-b text-center print:hidden"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></span>
                                                Memuat agregasi data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSummaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data untuk tanggal terpilih atau pencarian tidak cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummaries.map((s, idx) => {
                                        const durasi = s.total_durasi_menit || 0;
                                        const percent = Math.round((durasi / targetMinutes) * 100);
                                        const status = getFteStatus(durasi);
                                        const key = String(s.id_pegawai);
                                        const isExpanded = expandedEmployee === key;
                                        const logs = detailLogs[key] || [];
                                        const isDetailLoading = detailLoading[key];

                                        return (
                                            <React.Fragment key={s.id_pegawai || idx}>
                                                <tr className="hover:bg-indigo-50/30 transition-colors print:break-inside-avoid">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{s.nama_lengkap}</div>
                                                        <div className="text-xs text-gray-500">NIP: {s.nip}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-800">{s.departemen}</div>
                                                        <div className="text-xs text-gray-500">{s.jabatan}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {s.jumlah_log ? (
                                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium text-xs">
                                                                {s.jumlah_log} input
                                                            </span>
                                                        ) : <span className="text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {durasi > 0 ? (
                                                            <div className="font-bold text-gray-900 leading-tight">
                                                                {durasi} <span className="font-normal text-gray-500 text-[11px]">menit</span><br />
                                                                <span className="font-medium text-indigo-600 text-xs text-center block leading-tight">({(durasi / 60).toFixed(2).replace('.', ',')} jam)</span>
                                                            </div>
                                                        ) : <span className="text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {durasi > 0 ? (
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
                                                                <div className={clsx("h-2.5 rounded-full", percent > 100 ? "bg-red-500" : (percent >= 80 ? "bg-green-500" : "bg-yellow-500"))} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                                            </div>
                                                        ) : null}
                                                        <span className="text-xs font-semibold">{percent}%</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {durasi > 0 ? (
                                                            <span className={clsx("px-2.5 py-1 text-xs font-medium rounded-full", status.color)}>
                                                                {status.label}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Belum Log</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center print:hidden">
                                                        {s.jumlah_log > 0 && (
                                                            <button
                                                                onClick={() => handleToggleExpand(s)}
                                                                className="text-indigo-600 hover:text-indigo-900 flex items-center mx-auto text-xs font-medium"
                                                            >
                                                                {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                                                {isExpanded ? 'Tutup' : 'Lihat & Approve'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Expanded detail row */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={7} className="px-0 py-0 bg-indigo-50/40">
                                                            <div className="px-8 py-4 border-t border-indigo-100">
                                                                <h4 className="text-sm font-semibold text-indigo-900 mb-3">
                                                                    Detail Log Aktivitas — {s.nama_lengkap} ({startDate} s/d {endDate})
                                                                </h4>
                                                                {isDetailLoading ? (
                                                                    <div className="text-sm text-gray-500 py-4 text-center">Memuat detail...</div>
                                                                ) : logs.length === 0 ? (
                                                                    <div className="text-sm text-gray-500 py-2">Tidak ada log ditemukan.</div>
                                                                ) : (
                                                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                                                        <thead className="bg-indigo-100 text-indigo-800 text-xs uppercase">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left">Aktivitas</th>
                                                                                <th className="px-4 py-2 text-center">Frekuensi</th>
                                                                                <th className="px-4 py-2 text-center">Durasi</th>
                                                                                <th className="px-4 py-2 text-left">Catatan</th>
                                                                                <th className="px-4 py-2 text-center">Status</th>
                                                                                <th className="px-4 py-2 text-center">Aksi</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100 bg-white">
                                                                            {logs.map((log: any) => (
                                                                                <tr key={log.id_log}>
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="font-medium">{log.activityName || log.id_activity_library}</div>
                                                                                        <div className="text-xs text-gray-400">{log.category || ''}</div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center">{log.frekuensi}x</td>
                                                                                    <td className="px-4 py-3 text-center font-medium">{log.total_durasi_terhitung} menit</td>
                                                                                    <td className="px-4 py-3 text-xs text-gray-500">{log.catatan || '-'}</td>
                                                                                    <td className="px-4 py-3 text-center">
                                                                                        <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", getStatusBadge(log.status_approval || 'pending'))}>
                                                                                            {log.status_approval || 'pending'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center">
                                                                                        <div className="flex gap-2 justify-center">
                                                                                            <button
                                                                                                onClick={() => handleUpdateStatus(log.id_log, 'approved', key)}
                                                                                                disabled={updatingId === log.id_log || log.status_approval === 'approved'}
                                                                                                title="Approve"
                                                                                                className={clsx(
                                                                                                    "p-1.5 rounded-full transition-colors",
                                                                                                    log.status_approval === 'approved'
                                                                                                        ? "bg-green-100 text-green-400 cursor-default"
                                                                                                        : "bg-green-50 text-green-600 hover:bg-green-100"
                                                                                                )}
                                                                                            >
                                                                                                <CheckCircle className="h-4 w-4" />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleUpdateStatus(log.id_log, 'rejected', key)}
                                                                                                disabled={updatingId === log.id_log || log.status_approval === 'rejected'}
                                                                                                title="Reject"
                                                                                                className={clsx(
                                                                                                    "p-1.5 rounded-full transition-colors",
                                                                                                    log.status_approval === 'rejected'
                                                                                                        ? "bg-red-100 text-red-400 cursor-default"
                                                                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                                                                )}
                                                                                            >
                                                                                                <XCircle className="h-4 w-4" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Signature Footer */}
            <div className="mt-20 pt-8 border-t border-gray-200 print:mt-16 print:border-t-0 hidden lg:block print:block print:break-inside-avoid">
                <div className="text-center text-sm font-semibold text-gray-800 mb-12">
                    Mengetahui
                </div>
                <div className="flex justify-between items-center text-center px-8 sm:px-16 lg:px-32">
                    <div className="w-1/3 flex flex-col items-center">
                        <p className="text-sm font-bold text-gray-800 mb-20">
                            Direktur Utama
                        </p>
                        <div className="w-64 border-b-2 border-gray-800"></div>
                        <p className="text-sm font-bold text-gray-800 mt-2 uppercase">{directorNames.direkturUtama}</p>
                    </div>

                    <div className="w-1/3 flex flex-col items-center">
                        <p className="text-sm font-bold text-gray-800 mb-20">
                            Direktur YMFK
                        </p>
                        <div className="w-64 border-b-2 border-gray-800"></div>
                        <p className="text-sm font-bold text-gray-800 mt-2 uppercase">{directorNames.direkturYmfk}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminWlaSummaryPage;
