import React, { useEffect, useState } from 'react';
import { getSupervisorDashboardData } from '../../../shared/services/dashboardAPI';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import { Pegawai } from '../../01-pegawai/types';

interface SupervisorStats {
    totalTeam: number;
    presentToday: number;
    onLeaveToday: number;
    pendingLeaves: number;
}

const SupervisorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<SupervisorStats | null>(null);
    const [subordinates, setSubordinates] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getSupervisorDashboardData();
                if (response.success && response.data) {
                    setStats(response.data.stats);
                    setSubordinates(response.data.subordinates);
                } else {
                    setError('Gagal memuat data dashboard.');
                }
            } catch (err) {
                console.error('Error fetching supervisor dashboard data:', err);
                setError('Terjadi kesalahan saat memuat data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Anggota Tim',
            value: stats?.totalTeam || 0,
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            title: 'Hadir Hari Ini',
            value: stats?.presentToday || 0,
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30'
        },
        {
            title: 'Izin / Cuti',
            value: stats?.onLeaveToday || 0,
            icon: Calendar,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30'
        },
        {
            title: 'Menunggu Persetujuan',
            value: stats?.pendingLeaves || 0,
            icon: AlertCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-100 dark:bg-red-900/30'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getGreeting()}, {user?.name} 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Berikut adalah ringkasan tim Anda hari ini.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow transition-all hover:scale-[1.02]">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daftar Anggota Tim</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                <thead className="bg-gray-50 dark:bg-neutral-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jabatan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departemen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                                    {subordinates.length > 0 ? (
                                        subordinates.map((sub) => (
                                            <tr key={sub.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img className="h-10 w-10 rounded-full object-cover" src={sub.avatarUrl || '/avatars/default-avatar.jpg'} alt="" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{sub.name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{sub.nip}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {sub.position}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {sub.department}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                        {sub.isActive ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada anggota tim.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Aktivitas Tim Terbaru</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                                <Clock className="h-10 w-10 mb-2" />
                                <p>Belum ada aktivitas tim</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;
