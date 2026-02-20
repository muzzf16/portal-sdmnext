import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Plus, List, Clock, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';
import AktivitasHarianForm from '../components/AktivitasHarianForm';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getDailyActivitiesByEmployeeId } from '../api/dailyActivityApi';
import { DailyActivity } from '../types';
import clsx from 'clsx';

const AktivitasHarianPage: React.FC = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [activities, setActivities] = useState<DailyActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async () => {
        if (!user?.employeeId) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await getDailyActivitiesByEmployeeId(user.employeeId);
            // Sort by newest first
            const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()) : [];
            setActivities(sortedData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat data aktivitas harian.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [user?.employeeId]);

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchActivities();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <List className="mr-2 h-6 w-6 text-indigo-600" />
                        Aktivitas Harian
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Catat dan monitoring bukti pekerjaan harian Anda sebagai dasar capaian KPI.
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> Catat Aktivitas
                    </Button>
                )}
            </div>

            {showForm ? (
                <AktivitasHarianForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <Card className="shadow-soft-shadow">
                    <div className="bg-gray-50 border-b pb-4 px-6 pt-5 rounded-t-lg">
                        <h2 className="text-lg font-semibold flex items-center justify-between">
                            <span>Riwayat Aktivitas Anda</span>
                            <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border">
                                Total: {activities.length} catatan
                            </span>
                        </h2>
                    </div>
                    <div className="p-0">
                        {error && (
                            <div className="m-6 bg-red-50 p-4 rounded-md text-sm text-red-600 border border-red-200">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center p-12 text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                                Memuat data...
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center p-12 bg-gray-50 rounded-b-lg">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada aktivitas tercatat</h3>
                                <p className="text-gray-500 mb-4 max-w-sm mx-auto">Mulai catat pekerjaan harian Anda agar pencapaian target kinerja lebih akurat dan terukur.</p>
                                <Button onClick={() => setShowForm(true)} variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                    Catat Aktivitas Pertama
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Tanggal & Waktu</th>
                                            <th className="px-6 py-4">Nama Aktivitas</th>
                                            <th className="px-6 py-4">Durasi</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4">Bukti</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activities.map((act) => (
                                            <tr key={act.id_daily_activity} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                                        {act.tanggal}
                                                    </div>
                                                    <div className="text-gray-500 text-xs mt-1 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                                        {act.jam_mulai} - {act.jam_selesai}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800">{act.activityName}</div>
                                                    {act.catatan && <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{act.catatan}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium">{act.durasiMenit}</span> <span className="text-gray-500 text-xs">menit</span>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center",
                                                        act.status === 'approved' && "bg-green-100 text-green-800",
                                                        act.status === 'pending' && "bg-yellow-100 text-yellow-800",
                                                        act.status === 'rejected' && "bg-red-100 text-red-800"
                                                    )}>
                                                        {act.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {act.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                                        {act.status.charAt(0).toUpperCase() + act.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {act.evidenceUrl ? (
                                                        <a href={act.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors">
                                                            Lihat Bukti
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Tidak ada</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AktivitasHarianPage;
