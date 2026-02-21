import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Download, Users, Search } from 'lucide-react';
import { getAdminLogAktivitasSummaryWla } from '../api/logAktivitasHarianApi';
import { AdminWlaSummary } from '../types';
import clsx from 'clsx';

const AdminWlaSummaryPage: React.FC = () => {
    const [summaries, setSummaries] = useState<AdminWlaSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminLogAktivitasSummaryWla(selectedDate);
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
    }, [selectedDate]);

    // Helpers for calculating FTE
    const EFFECTIVE_WORKING_MINUTES = 480; // 8 hours * 60

    const getFteStatus = (minutes: number) => {
        const percentage = (minutes / EFFECTIVE_WORKING_MINUTES) * 100;
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

        const headers = ['Karyawan', 'NIP', 'Departemen', 'Jabatan', 'Aktivitas Dilog', 'Durasi Total (Menit)', 'Beban (FTE %)', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredSummaries.map(s => {
                const durasi = s.total_durasi_menit || 0;
                const percent = Math.round((durasi / EFFECTIVE_WORKING_MINUTES) * 100);
                const status = getFteStatus(durasi).label;
                return `"${s.nama_lengkap}","${s.nip}","${s.departemen}","${s.jabatan}","${s.jumlah_log}","${durasi}","${percent}%","${status}"`;
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Rekap_WLA_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
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

            <Card className="shadow-lg border-t-4 border-t-indigo-600">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <label className="text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1">Pilih Tanggal</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-48"
                                />
                            </div>
                            <div className="relative w-full md:w-64">
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

                        {/* Export Button if needed later */}
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 p-4 rounded-md text-sm text-red-600 border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm text-left align-middle">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                                <tr>
                                    <th className="px-6 py-4 border-b">Karyawan</th>
                                    <th className="px-6 py-4 border-b">Departemen / Jabatan</th>
                                    <th className="px-6 py-4 border-b text-center">Aktivitas Dilog</th>
                                    <th className="px-6 py-4 border-b text-center">Durasi Total</th>
                                    <th className="px-6 py-4 border-b text-center">Beban (FTE)</th>
                                    <th className="px-6 py-4 border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></span>
                                                Memuat agregasi data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSummaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data untuk tanggal terpilih atau pencarian tidak cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummaries.map((s, idx) => {
                                        const durasi = s.total_durasi_menit || 0;
                                        const percent = Math.round((durasi / EFFECTIVE_WORKING_MINUTES) * 100);
                                        const status = getFteStatus(durasi);

                                        return (
                                            <tr key={s.id_pegawai || idx} className="hover:bg-indigo-50/30 transition-colors">
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
                                                        <div className="font-bold text-gray-900">{durasi} <span className="font-normal text-gray-500 text-xs text-center block">menit</span></div>
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
                                            </tr>
                                        )
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

export default AdminWlaSummaryPage;
