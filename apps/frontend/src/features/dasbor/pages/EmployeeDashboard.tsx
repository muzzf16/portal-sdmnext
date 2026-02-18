import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getEmployeeAttendanceSummary, getEmployeeWeeklyAttendance } from '../../../shared/services/attendanceAPI';
import { getSisaCuti } from '../../../shared/services/leaveAPI';
import { getEmployeeLatestPayroll } from '../../../shared/services/payrollAPI';
import { getEmployeeRecentNotifications } from '../../../shared/services/notifikasiAPI';
import { Loader2, Inbox, Calendar, CheckCircle, Wallet, User, Clock, BarChart3, GraduationCap, Bell } from 'lucide-react';

import { Absensi, Notifikasi, Penggajian } from '../../../shared/types/types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const employeeId = user?.employeeId;

  // ALL hooks must be called before any early return
  const [attendanceSummary, setAttendanceSummary] = useState<{ totalDays: number; presentDays: number } | null>(null);
  const [loadingAttendanceSummary, setLoadingAttendanceSummary] = useState<boolean>(true);
  const [errorAttendanceSummary, setErrorAttendanceSummary] = useState<string | null>(null);

  const [sisaCuti, setSisaCuti] = useState<{ sisaCuti: number } | null>(null);
  const [loadingSisaCuti, setLoadingSisaCuti] = useState<boolean>(true);
  const [errorSisaCuti, setErrorSisaCuti] = useState<string | null>(null);

  const [latestPayroll, setLatestPayroll] = useState<Penggajian | null>(null);
  const [loadingLatestPayroll, setLoadingLatestPayroll] = useState<boolean>(true);
  const [errorLatestPayroll, setErrorLatestPayroll] = useState<string | null>(null);

  const [weeklyAttendance, setWeeklyAttendance] = useState<Absensi[]>([]);
  const [loadingWeeklyAttendance, setLoadingWeeklyAttendance] = useState<boolean>(true);
  const [errorWeeklyAttendance, setErrorWeeklyAttendance] = useState<string | null>(null);

  const [recentNotifications, setRecentNotifications] = useState<Notifikasi[]>([]);
  const [loadingRecentNotifications, setLoadingRecentNotifications] = useState<boolean>(true);
  const [errorRecentNotifications, setErrorRecentNotifications] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const handleApiError = (error: any, setError: (msg: string) => void, apiName: string) => {
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(`Gagal memuat data ${apiName}.`);
      console.error(`Error fetching ${apiName}:`, error);
    };

    const fetchAttendanceSummary = async () => {
      try {
        const summary = await getEmployeeAttendanceSummary(employeeId.toString());
        setAttendanceSummary(summary);
      } catch (error) {
        handleApiError(error, setErrorAttendanceSummary, 'kehadiran');
      } finally {
        setLoadingAttendanceSummary(false);
      }
    };

    const fetchSisaCuti = async () => {
      try {
        const response = await getSisaCuti(employeeId.toString());
        setSisaCuti(response.data);
      } catch (error) {
        handleApiError(error, setErrorSisaCuti, 'sisa cuti');
      } finally {
        setLoadingSisaCuti(false);
      }
    };

    const fetchLatestPayroll = async () => {
      try {
        const payroll = await getEmployeeLatestPayroll(employeeId.toString());
        setLatestPayroll(payroll);
      } catch (error) {
        handleApiError(error, setErrorLatestPayroll, 'penggajian');
      } finally {
        setLoadingLatestPayroll(false);
      }
    };

    const fetchWeeklyAttendance = async () => {
      try {
        const attendance = await getEmployeeWeeklyAttendance(employeeId.toString());
        setWeeklyAttendance(attendance);
      } catch (error) {
        handleApiError(error, setErrorWeeklyAttendance, 'rekap mingguan');
      } finally {
        setLoadingWeeklyAttendance(false);
      }
    };

    const fetchRecentNotifications = async () => {
      try {
        const notifications = await getEmployeeRecentNotifications(employeeId.toString());
        setRecentNotifications(notifications);
      } catch (error) {
        handleApiError(error, setErrorRecentNotifications, 'notifikasi');
      } finally {
        setLoadingRecentNotifications(false);
      }
    };

    fetchAttendanceSummary();
    fetchSisaCuti();
    fetchLatestPayroll();
    fetchWeeklyAttendance();
    fetchRecentNotifications();
  }, [employeeId, logout, navigate]);

  // Early return AFTER all hooks
  if (!employeeId) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        Data pegawai tidak ditemukan atau tidak valid. Silakan login ulang atau hubungi admin.
      </div>
    );
  }

  const attendancePercentage = attendanceSummary && attendanceSummary.totalDays > 0
    ? ((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100).toFixed(0)
    : 'N/A';

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const quickActions = [
    { title: 'Profil Saya', path: `/dashboard/pegawai/${employeeId}`, icon: User },
    { title: 'Absensi Saya', path: '/dashboard/absensi-saya', icon: Clock },
    { title: 'Cuti Saya', path: '/dashboard/cuti-saya', icon: Calendar },
    { title: 'Gaji Saya', path: '/dashboard/penggajian-saya', icon: Wallet },
    { title: 'Kinerja Saya', path: '/dashboard/kinerja-saya', icon: BarChart3 },
    { title: 'Pelatihan Saya', path: '/dashboard/pelatihan-saya', icon: GraduationCap },
    { title: 'Notifikasi', path: '/dashboard/notifikasi', icon: Bell }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <main>
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.name || 'Karyawan'} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{todayStr}</p>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Sisa Cuti Tahun Ini',
              value: loadingSisaCuti ? '...' : errorSisaCuti ? 'Error' : sisaCuti !== null ? sisaCuti.sisaCuti.toString() : 'N/A',
              unit: 'hari',
              icon: Calendar,
              color: 'text-orange-500',
              bgColor: 'bg-orange-100 dark:bg-orange-900/30'
            },
            {
              title: 'Total Kehadiran',
              value: loadingAttendanceSummary ? '...' : errorAttendanceSummary ? 'Error' : attendancePercentage,
              unit: '%',
              icon: CheckCircle,
              color: 'text-green-500',
              bgColor: 'bg-green-100 dark:bg-green-900/30'
            },
            {
              title: 'Gaji Terakhir',
              value: loadingLatestPayroll ? '...' : errorLatestPayroll ? 'Error' : latestPayroll?.netSalary ? `Rp ${latestPayroll.netSalary.toLocaleString()}` : 'N/A',
              unit: '',
              icon: Wallet,
              color: 'text-emerald-500',
              bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value} {stat.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
                    <action.icon size={24} />
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{action.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Card */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Kehadiran Minggu Ini</h2>
            <div className="space-y-3">
              {loadingWeeklyAttendance ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
                  <span className="text-gray-500 dark:text-gray-400">Memuat data kehadiran...</span>
                </div>
              ) : errorWeeklyAttendance ? (
                <p className="text-red-500 dark:text-red-400 text-center py-4">{errorWeeklyAttendance}</p>
              ) : weeklyAttendance.length > 0 ? (
                weeklyAttendance.map((record: Absensi, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-700 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{record.date ? new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long' }) : 'N/A'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{record.date ? new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'hadir' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}>
                        {record.status || 'N/A'}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{record.clockIn || '--'} - {record.clockOut || '--'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                  <Inbox className="h-10 w-10 mb-2" />
                  <p>Belum ada data kehadiran minggu ini</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Notifikasi Terbaru</h2>
            <div className="space-y-4">
              {loadingRecentNotifications ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
                  <span className="text-gray-500 dark:text-gray-400">Memuat notifikasi...</span>
                </div>
              ) : errorRecentNotifications ? (
                <p className="text-red-500 dark:text-red-400 text-center py-4">{errorRecentNotifications}</p>
              ) : recentNotifications.length > 0 ? (
                recentNotifications.map((notification: Notifikasi, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 py-1">
                    <p className="text-gray-800 dark:text-gray-200">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.created_at ? new Date(notification.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                  <Bell className="h-10 w-10 mb-2" />
                  <p>Belum ada notifikasi terbaru</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;