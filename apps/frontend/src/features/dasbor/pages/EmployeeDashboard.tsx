import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getEmployeeAttendanceSummary, getEmployeeWeeklyAttendance } from '../../../shared/services/attendanceAPI';
import { getEmployeeApprovedLeaveCount } from '../../../shared/services/leaveAPI';
import { getEmployeeLatestPayroll } from '../../../shared/services/payrollAPI';
import { getEmployeeRecentNotifications } from '../../../shared/services/notifikasiAPI';
import { Attendance, Absensi, Notifikasi } from '../../../shared/types/types';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const employeeId = user?.employeeid;

  const [attendanceSummary, setAttendanceSummary] = useState<{ totalDays: number; presentDays: number } | null>(null);
  const [loadingAttendanceSummary, setLoadingAttendanceSummary] = useState<boolean>(true);
  const [errorAttendanceSummary, setErrorAttendanceSummary] = useState<string | null>(null);

  const [approvedLeaveCount, setApprovedLeaveCount] = useState<number | null>(null);
  const [loadingApprovedLeave, setLoadingApprovedLeave] = useState<boolean>(true);
  const [errorApprovedLeave, setErrorApprovedLeave] = useState<string | null>(null);

  const [latestPayroll, setLatestPayroll] = useState<{
    id: string;
    employee_id: number;
    period: string;
    base_salary: number;
    total_allowances: number;
    total_deductions: number;
    net_salary: number;
  } | null>(null);
  const [loadingLatestPayroll, setLoadingLatestPayroll] = useState<boolean>(true);
  const [errorLatestPayroll, setErrorLatestPayroll] = useState<string | null>(null);

  const [weeklyAttendance, setWeeklyAttendance] = useState<Attendance[]>([]);
  const [loadingWeeklyAttendance, setLoadingWeeklyAttendance] = useState<boolean>(true);
  const [errorWeeklyAttendance, setErrorWeeklyAttendance] = useState<string | null>(null);

  const [recentNotifications, setRecentNotifications] = useState<Notifikasi[]>([]);
  const [loadingRecentNotifications, setLoadingRecentNotifications] = useState<boolean>(true);
  const [errorRecentNotifications, setErrorRecentNotifications] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchAttendanceSummary = async () => {
      try {
        const summary = await getEmployeeAttendanceSummary(employeeId.toString());
        setAttendanceSummary(summary);
      } catch (error) {
        setErrorAttendanceSummary('Failed to fetch attendance summary.');
        console.error('Error fetching attendance summary:', error);
      } finally {
        setLoadingAttendanceSummary(false);
      }
    };

    const fetchApprovedLeaveCount = async () => {
      try {
        const count = await getEmployeeApprovedLeaveCount(employeeId.toString());
        setApprovedLeaveCount(count);
      } catch (error) {
        setErrorApprovedLeave('Failed to fetch approved leave count.');
        console.error('Error fetching approved leave count:', error);
      } finally {
        setLoadingApprovedLeave(false);
      }
    };

    const fetchLatestPayroll = async () => {
      try {
        const payroll = await getEmployeeLatestPayroll(employeeId.toString());
        setLatestPayroll(payroll);
      } catch (error) {
        setErrorLatestPayroll('Failed to fetch latest payroll.');
        console.error('Error fetching latest payroll:', error);
      } finally {
        setLoadingLatestPayroll(false);
      }
    };

    const fetchWeeklyAttendance = async () => {
      try {
        const attendance = await getEmployeeWeeklyAttendance(employeeId.toString());
        setWeeklyAttendance(attendance);
      } catch (error) {
        setErrorWeeklyAttendance('Failed to fetch weekly attendance.');
        console.error('Error fetching weekly attendance:', error);
      } finally {
        setLoadingWeeklyAttendance(false);
      }
    };

    const fetchRecentNotifications = async () => {
      try {
        const notifications = await getEmployeeRecentNotifications(employeeId.toString());
        setRecentNotifications(notifications);
      } catch (error) {
        setErrorRecentNotifications('Failed to fetch recent notifications.');
        console.error('Error fetching recent notifications:', error);
      } finally {
        setLoadingRecentNotifications(false);
      }
    };

    fetchAttendanceSummary();
    fetchApprovedLeaveCount();
    fetchLatestPayroll();
    fetchWeeklyAttendance();
    fetchRecentNotifications();
  }, [employeeId]);

  const attendancePercentage = attendanceSummary && attendanceSummary.totalDays > 0
    ? ((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100).toFixed(0)
    : 'N/A';

  const quickActions = [
    { title: 'Profil Saya', path: `/dashboard/pegawai/${employeeId}/detailpegawai`, icon: '👤' },
    { title: 'Absensi Saya', path: '/dashboard/absensi-saya', icon: '⏰' },
    { title: 'Cuti Saya', path: '/dashboard/cuti-saya', icon: '🗓️' },
    { title: 'Gaji Saya', path: '/dashboard/penggajian-saya', icon: '💰' },
    { title: 'Kinerja Saya', path: '/dashboard/kinerja-saya', icon: '📊' },
    { title: 'Pelatihan Saya', path: `/dashboard/pegawai/${employeeId}/pelatihan`, icon: '🎓' },
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
              value: loadingApprovedLeave ? '...' : errorApprovedLeave ? 'Error' : approvedLeaveCount !== null ? approvedLeaveCount.toString() : 'N/A', 
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
              value: loadingLatestPayroll ? '...' : errorLatestPayroll ? 'Error' : latestPayroll?.net_salary ? `Rp ${latestPayroll.net_salary.toLocaleString()}` : 'N/A', 
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
                weeklyAttendance.map((record: Attendance & Absensi, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{record.tanggal ? new Date(record.tanggal).toLocaleDateString('id-ID', { weekday: 'long' }) : 'N/A'}</p>
                      <p className="text-sm text-gray-500">{record.tanggal ? new Date(record.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status_kehadiran === 'hadir' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status_kehadiran || 'N/A'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{record.jam_masuk || '--'} - {record.jam_keluar || '--'}</p>
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
                    <h3 className="font-medium text-gray-800">{notification.title || 'Notifikasi'}</h3>
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