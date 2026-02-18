
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployees, getEmployeeGenderData, getEmployeeEducationData, getEmployeeDepartmentData } from '../../../shared/services/employeeAPI';
import { getTodayAttendanceCount } from '../../../shared/services/attendanceAPI';
import { getPendingLeaveRequestsCount } from '../../../shared/services/leaveAPI';
import { getExpiringContractsCount } from '../../../shared/services/kontrakAPI';
import {
  Users, Clock, Calendar, FileText, Eye, BarChart3, DollarSign, UserCheck, Building2,
  Loader2, Inbox
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import { getRecentActivity } from '../../../shared/services/dashboardAPI';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[300px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(true);
  const [errorEmployees, setErrorEmployees] = useState<string | null>(null);

  const [todayAttendanceCount, setTodayAttendanceCount] = useState<number | null>(null);
  const [loadingTodayAttendance, setLoadingTodayAttendance] = useState<boolean>(true);
  const [errorTodayAttendance, setErrorTodayAttendance] = useState<string | null>(null);

  const [pendingLeaveRequestsCount, setPendingLeaveRequestsCount] = useState<number | null>(null);
  const [loadingPendingLeaveRequests, setLoadingPendingLeaveRequests] = useState<boolean>(true);
  const [errorPendingLeaveRequests, setErrorPendingLeaveRequests] = useState<string | null>(null);

  const [expiringContractsCount, setExpiringContractsCount] = useState<number | null>(null);
  const [loadingExpiringContracts, setLoadingExpiringContracts] = useState<boolean>(true);
  const [errorExpiringContracts, setErrorExpiringContracts] = useState<string | null>(null);

  // Chart data states
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [educationData, setEducationData] = useState<{ name: string; employees: number }[]>([]);
  const [departmentData, setDepartmentData] = useState<{ name: string; value: number }[]>([]);
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true);
  const [errorCharts, setErrorCharts] = useState<string | null>(null);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingRecentActivity, setLoadingRecentActivity] = useState<boolean>(true);
  const [errorRecentActivity, setErrorRecentActivity] = useState<string | null>(null);

  const handleApiError = useCallback((error: any, setError: (m: string) => void, label: string) => {
    if (error?.response?.status === 401) {
      logout();
      navigate('/login');
      return;
    }
    setError(`Gagal memuat ${label}.`);
    console.error(`Error fetching ${label}: `, error);
  }, [logout, navigate]);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const response = await getEmployees();
        const employeesData = Array.isArray(response)
          ? response
          : (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data))
            ? (response as any).data
            : (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data?.data))
              ? (response as any).data.data
              : [];
        setTotalEmployees(employeesData.length);
      } catch (error) {
        handleApiError(error, setErrorEmployees, 'total karyawan');
      } finally {
        setLoadingEmployees(false);
      }
    };

    const fetchTodayAttendance = async () => {
      try {
        const count = await getTodayAttendanceCount();
        setTodayAttendanceCount(count);
      } catch (error) {
        handleApiError(error, setErrorTodayAttendance, 'kehadiran hari ini');
      } finally {
        setLoadingTodayAttendance(false);
      }
    };

    const fetchPendingLeaveRequests = async () => {
      try {
        const count = await getPendingLeaveRequestsCount();
        setPendingLeaveRequestsCount(count);
      } catch (error) {
        handleApiError(error, setErrorPendingLeaveRequests, 'pengajuan cuti');
      } finally {
        setLoadingPendingLeaveRequests(false);
      }
    };

    const fetchExpiringContracts = async () => {
      try {
        const count = await getExpiringContractsCount();
        setExpiringContractsCount(count);
      } catch (error) {
        handleApiError(error, setErrorExpiringContracts, 'kontrak berakhir');
      } finally {
        setLoadingExpiringContracts(false);
      }
    };

    const fetchChartData = async () => {
      try {
        const [genderResponse, educationResponse, deptResponse] = await Promise.all([
          getEmployeeGenderData(),
          getEmployeeEducationData(),
          getEmployeeDepartmentData()
        ]);
        const gd = Array.isArray(genderResponse) ? genderResponse : (genderResponse?.data || []);
        const ed = Array.isArray(educationResponse) ? educationResponse : (educationResponse?.data || []);
        const dd = Array.isArray(deptResponse) ? deptResponse : (deptResponse?.data || []);
        setGenderData(gd);
        setEducationData(ed);
        setDepartmentData(dd);
      } catch (error) {
        handleApiError(error, setErrorCharts, 'data chart');
      } finally {
        setLoadingCharts(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const data = await getRecentActivity();
        setRecentActivity(Array.isArray(data) ? data : []);
      } catch (error) {
        handleApiError(error, setErrorRecentActivity, 'aktivitas terbaru');
      } finally {
        setLoadingRecentActivity(false);
      }
    };

    Promise.all([
      fetchTotalEmployees(),
      fetchTodayAttendance(),
      fetchPendingLeaveRequests(),
      fetchExpiringContracts(),
      fetchChartData(),
      fetchRecentActivity(),
    ]).catch(error => {
      console.error('An error occurred during initial data fetching:', error);
    });
  }, [handleApiError]);

  const stats = useMemo(() => ([
    {
      title: 'Total Karyawan',
      value: loadingEmployees ? '...' : errorEmployees ? 'Error' : totalEmployees !== null ? totalEmployees.toString() : 'N/A',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      link: '/dashboard/pegawai'
    },
    {
      title: 'Hadir Hari Ini',
      value: loadingTodayAttendance ? '...' : errorTodayAttendance ? 'Error' : todayAttendanceCount !== null ? todayAttendanceCount.toString() : 'N/A',
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      link: '/dashboard/absensi'
    },
    {
      title: 'Pengajuan Cuti',
      value: loadingPendingLeaveRequests ? '...' : errorPendingLeaveRequests ? 'Error' : pendingLeaveRequestsCount !== null ? pendingLeaveRequestsCount.toString() : 'N/A',
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      link: '/dashboard/cuti'
    },
    {
      title: 'Kontrak Berakhir',
      value: loadingExpiringContracts ? '...' : errorExpiringContracts ? 'Error' : expiringContractsCount !== null ? expiringContractsCount.toString() : 'N/A',
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      link: '/dashboard/kontrak'
    }
  ]), [
    loadingEmployees, errorEmployees, totalEmployees,
    loadingTodayAttendance, errorTodayAttendance, todayAttendanceCount,
    loadingPendingLeaveRequests, errorPendingLeaveRequests, pendingLeaveRequestsCount,
    loadingExpiringContracts, errorExpiringContracts, expiringContractsCount
  ]);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <main>
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.name || 'Admin'} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{todayStr}</p>
        </div>

        {/* Stats Overview — clickable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-xl shadow transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className={`p - 3 rounded - lg ${stat.bgColor} `} aria-hidden="true">
                  <stat.icon size={24} className={stat.color} aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Employee Analysis Charts — 3 charts */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Analisis Karyawan</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gender Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Gender</h3>
            {loadingCharts ? <LoadingSpinner /> : errorCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-red-500 dark:text-red-400">{errorCharts}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart aria-label="Chart Distribusi Gender">
                  <Pie data={genderData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value"
                    label={(props) => {
                      const { name, percent } = props as any;
                      return `${name} ${(Number(percent) * 100).toFixed(0)}% `;
                    }}
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Education Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Pendidikan</h3>
            {loadingCharts ? <LoadingSpinner /> : errorCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-red-500 dark:text-red-400">{errorCharts}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={educationData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employees" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Department Pie Chart — NEW */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Departemen</h3>
            {loadingCharts ? <LoadingSpinner /> : errorCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-red-500 dark:text-red-400">{errorCharts}</p>
              </div>
            ) : departmentData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-[300px] text-gray-400 dark:text-gray-500">
                <Building2 className="h-10 w-10 mb-2" />
                <p>Belum ada data departemen</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart aria-label="Chart Distribusi Departemen">
                  <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value"
                    label={(props) => {
                      const { name, percent } = props as any;
                      return `${name} ${(Number(percent) * 100).toFixed(0)}% `;
                    }}
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`dept - ${index} `} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { title: 'Manajemen Karyawan', path: '/dashboard/pegawai', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400' },
              { title: 'Absensi', path: '/dashboard/absensi', icon: Clock, color: 'bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400' },
              { title: 'Cuti & Izin', path: '/dashboard/cuti', icon: Calendar, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400' },
              { title: 'Penggajian', path: '/dashboard/penggajian', icon: DollarSign, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400' },
              { title: 'Kontrak', path: '/dashboard/kontrak', icon: FileText, color: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' },
              { title: 'Kinerja', path: '/dashboard/kinerja', icon: BarChart3, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400' },
              { title: 'Struktur Organisasi', path: '/dashboard/jabatan', icon: Building2, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400' },
              { title: 'Rekrutmen', path: '/dashboard/perekrutan', icon: UserCheck, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 dark:text-cyan-400' },
            ].map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-lg shadow text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                title={action.title}
              >
                <div className="flex justify-center mb-3">
                  <div className={`p - 3 rounded - lg ${action.color} `}>
                    <action.icon size={24} />
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm md:text-base">{action.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Aktivitas Terbaru</h2>
            <Link to="/dashboard/laporan" className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
              <span>Lihat Semua</span>
              <Eye size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {loadingRecentActivity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
                <span className="text-gray-500 dark:text-gray-400">Memuat aktivitas...</span>
              </div>
            ) : errorRecentActivity ? (
              <p className="text-red-500 dark:text-red-400 text-center py-4">{errorRecentActivity}</p>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                <Inbox className="h-12 w-12 mb-3" />
                <p>Belum ada aktivitas terbaru</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start border-b border-gray-100 dark:border-neutral-700 pb-3 last:border-0 last:pb-0">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2 mr-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">{activity.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.user} • {new Date(activity.time).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
