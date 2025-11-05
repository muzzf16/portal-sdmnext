import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getEmployeeAttendanceSummary, getEmployeeWeeklyAttendance } from '../../../shared/services/attendanceAPI';
import { getSisaCuti } from '../../../shared/services/leaveAPI';
import { getEmployeeLatestPayroll } from '../../../shared/services/payrollAPI';
import { getEmployeeRecentNotifications } from '../../../shared/services/notifikasiAPI';

import { Absensi, Notifikasi, Penggajian } from '../../../shared/types/types';

// Force re-evaluation of imports

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate ? useNavigate() : (() => {}); // pastikan useNavigate jika AppContext pakai react-router v6
  const employeeId = user?.employeeId;

  // Render jika employeeId tidak ada (prevent looping fetch error)
  if (!employeeId) {
    return (
      <div className="text-center p-8 text-gray-500">
        Data pegawai tidak ditemukan atau tidak valid. Silakan login ulang atau hubungi admin.
      </div>
    );
  }

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
        navigate && navigate('/login');
        return;
      }
      setError(`Gagal mendapatkan data ${apiName}.`);
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
  }, [employeeId]);

  const attendancePercentage = attendanceSummary && attendanceSummary.totalDays > 0
    ? ((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100).toFixed(0)
    : 'N/A';

  const quickActions = [
    { title: 'Profil Saya', path: `/dashboard/pegawai/${employeeId}`, icon: '👤' },
    { title: 'Absensi Saya', path: '/dashboard/absensi-saya', icon: '⏰' },
    { title: 'Cuti Saya', path: '/dashboard/cuti-saya', icon: '🗓️' },
    { title: 'Gaji Saya', path: '/dashboard/penggajian-saya', icon: '💰' },
    { title: 'Kinerja Saya', path: '/dashboard/kinerja-saya', icon: '📊' },
    { title: 'Pelatihan Saya', path: '/dashboard/pelatihan-saya', icon: '🎓' },
    { title: 'Notifikasi', path: '/dashboard/notifikasi', icon: '🔔' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <main>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Dashboard Karyawan</h2>
        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[ 
            { 
              title: 'Sisa Cuti Tahun Ini', 
              value: loadingSisaCuti ? '...' : errorSisaCuti ? 'Error' : sisaCuti !== null ? sisaCuti.sisaCuti.toString() : 'N/A', 
              unit: 'hari', 
              icon: '🗓️' 
            },
            { 
              title: 'Total Kehadiran', 
              value: loadingAttendanceSummary ? '...' : errorAttendanceSummary ? 'Error' : attendancePercentage,
              unit: '%', 
              icon: '✅' 
            },
            { 
              title: 'Gaji Terakhir', 
              value: loadingLatestPayroll ? '...' : errorLatestPayroll ? 'Error' : latestPayroll?.netSalary ? `Rp ${latestPayroll.netSalary.toLocaleString()}` : 'N/A', 
              unit: '', 
              icon: '💰' 
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="text-2xl mr-4">{stat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value} {stat.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.path}
                className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="font-medium text-gray-800">{action.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kehadiran Minggu Ini</h2>
            <div className="space-y-3">
              {loadingWeeklyAttendance ? (
                <div>Loading weekly attendance...</div>
              ) : errorWeeklyAttendance ? (
                <div>Error: {errorWeeklyAttendance}</div>
              ) : weeklyAttendance.length > 0 ? (
                weeklyAttendance.map((record: Absensi, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{record.date ? new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long' }) : 'N/A'}</p>
                      <p className="text-sm text-gray-500">{record.date ? new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'hadir' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status || 'N/A'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{record.clockIn || '--'} - {record.clockOut || '--'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div>No attendance records for this week.</div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifikasi Terbaru</h2>
            <div className="space-y-4">
              {loadingRecentNotifications ? (
                <div>Loading recent notifications...</div>
              ) : errorRecentNotifications ? (
                <div>Error: {errorRecentNotifications}</div>
              ) : recentNotifications.length > 0 ? (
                recentNotifications.map((notification: Notifikasi, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-1">
                    <h3 className="font-medium text-gray-800">{notification.message.substring(0, 50)}...</h3> {/* Use message as title, truncated */}
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.created_at ? new Date(notification.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <div>No recent notifications.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;