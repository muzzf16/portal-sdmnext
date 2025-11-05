import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployees, getEmployeeGenderData, getEmployeeEducationData } from '../../../shared/services/employeeAPI';
import { getTodayAttendanceCount } from '../../../shared/services/attendanceAPI';
import { getPendingLeaveRequestsCount } from '../../../shared/services/leaveAPI';
import { getExpiringContractsCount } from '../../../shared/services/kontrakAPI';
import { Users, Clock, Calendar, FileText, Eye, BarChart3, DollarSign, UserCheck, File } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';

import { getRecentActivity } from '../../../shared/services/dashboardAPI';

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true);
  const [errorCharts, setErrorCharts] = useState<string | null>(null);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingRecentActivity, setLoadingRecentActivity] = useState<boolean>(true);
  const [errorRecentActivity, setErrorRecentActivity] = useState<string | null>(null);

  useEffect(() => {
    const handleApiError = (error: any, setError: (m: string) => void, label: string) => {
      if (error?.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setError(`Failed to fetch ${label}.`);
      // eslint-disable-next-line no-console
      console.error(`Error fetching ${label}:`, error);
    };

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
        handleApiError(error, setErrorEmployees, 'total employees');
      } finally {
        setLoadingEmployees(false);
      }
    };

    const fetchTodayAttendance = async () => {
      try {
        const count = await getTodayAttendanceCount();
        setTodayAttendanceCount(count);
      } catch (error) {
        handleApiError(error, setErrorTodayAttendance, "today's attendance");
      } finally {
        setLoadingTodayAttendance(false);
      }
    };

    const fetchPendingLeaveRequests = async () => {
      try {
        const count = await getPendingLeaveRequestsCount();
        setPendingLeaveRequestsCount(count);
      } catch (error) {
        handleApiError(error, setErrorPendingLeaveRequests, 'pending leave requests');
      } finally {
        setLoadingPendingLeaveRequests(false);
      }
    };

    const fetchExpiringContracts = async () => {
      try {
        const count = await getExpiringContractsCount();
        setExpiringContractsCount(count);
      } catch (error) {
        handleApiError(error, setErrorExpiringContracts, 'expiring contracts');
      } finally {
        setLoadingExpiringContracts(false);
      }
    };

    const fetchChartData = async () => {
      try {
        const [genderResponse, educationResponse] = await Promise.all([
          getEmployeeGenderData(),
          getEmployeeEducationData()
        ]);
        setGenderData(genderResponse);
        setEducationData(educationResponse);
      } catch (error) {
        handleApiError(error, setErrorCharts, 'chart data');
      } finally {
        setLoadingCharts(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await getRecentActivity();
        setRecentActivity(response.data.data);
      } catch (error) {
        handleApiError(error, setErrorRecentActivity, 'recent activity');
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
      // eslint-disable-next-line no-console
      console.error('An error occurred during initial data fetching:', error);
      setLoadingEmployees(false);
      setLoadingTodayAttendance(false);
      setLoadingPendingLeaveRequests(false);
      setLoadingExpiringContracts(false);
      setLoadingCharts(false);
      setLoadingRecentActivity(false);
    });
  }, [logout, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <main>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Dashboard Admin</h2>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[ 
            { 
              title: 'Total Karyawan', 
              value: loadingEmployees ? '...' : errorEmployees ? 'Error' : totalEmployees !== null ? totalEmployees.toString() : 'N/A', 
              change: '+5%', 
              icon: Users,
              color: 'text-blue-500'
            },
            { 
              title: 'Hari Ini Masuk', 
              value: loadingTodayAttendance ? '...' : errorTodayAttendance ? 'Error' : todayAttendanceCount !== null ? todayAttendanceCount.toString() : 'N/A', 
              change: '+2%', 
              icon: Clock,
              color: 'text-green-500'
            },
            { 
              title: 'Pengajuan Cuti', 
              value: loadingPendingLeaveRequests ? '...' : errorPendingLeaveRequests ? 'Error' : pendingLeaveRequestsCount !== null ? pendingLeaveRequestsCount.toString() : 'N/A', 
              change: '+1', 
              icon: Calendar,
              color: 'text-orange-500'
            },
            { 
              title: 'Kontrak Berakhir', 
              value: loadingExpiringContracts ? '...' : errorExpiringContracts ? 'Error' : expiringContractsCount !== null ? expiringContractsCount.toString() : 'N/A', 
              change: '0', 
              icon: FileText,
              color: 'text-red-500'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-xl shadow transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20`} aria-hidden="true">
                  <stat.icon size={24} className={stat.color} aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-green-500 dark:text-green-400">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Employee Analysis Charts */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Analisis Karyawan</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Gender</h3>
            {loadingCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p>Loading chart data...</p>
              </div>
            ) : errorCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-red-500">{errorCharts}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart aria-label="Chart Distribusi Gender">
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props) => {
                      const { name, percent } = props as any;
                      return `${name} ${(Number(percent) * 100).toFixed(0)}%`;
                    }}
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Pendidikan</h3>
            {loadingCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p>Loading chart data...</p>
              </div>
            ) : errorCharts ? (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-red-500">{errorCharts}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={educationData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                  aria-label="Chart Distribusi Pendidikan"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-sm text-gray-600 dark:text-gray-300" />
                  <YAxis className="text-sm text-gray-600 dark:text-gray-300" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employees" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[ 
              { title: 'Manajemen Karyawan', path: '/dashboard/pegawai', icon: Users },
              { title: 'Absensi', path: '/dashboard/absensi', icon: Clock },
              { title: 'Cuti & Izin', path: '/dashboard/cuti', icon: Calendar },
              { title: 'Penggajian', path: '/dashboard/penggajian', icon: DollarSign },
              { title: 'Kontrak', path: '/dashboard/kontrak', icon: FileText },
              { title: 'Kinerja', path: '/dashboard/kinerja', icon: BarChart3 },
              { title: 'Rekrutmen', path: '/dashboard/perekrutan', icon: UserCheck },
              { title: 'Laporan', path: '/dashboard/laporan', icon: File }
            ].map((action, index) => (
              <Link 
                key={index} 
                to={action.path}
                className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-lg shadow text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                title={action.title}
                aria-label={action.title}
              >
                <div className="flex justify-center mb-3" aria-hidden="true">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
                    <action.icon size={24} aria-hidden="true" />
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
            <button className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center" title="Lihat Semua Aktivitas" aria-label="Lihat Semua Aktivitas">
              <span>Lihat Semua</span>
              <Eye size={16} className="ml-1" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-4">
            {loadingRecentActivity ? (
              <p>Loading recent activity...</p>
            ) : errorRecentActivity ? (
              <p className="text-red-500">{errorRecentActivity}</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start border-b border-gray-100 dark:border-neutral-700 pb-3 last:border-0 last:pb-0">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2 mr-3" aria-hidden="true">
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
