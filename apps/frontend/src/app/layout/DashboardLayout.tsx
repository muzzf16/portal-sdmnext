import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '@/app/hooks/useSidebar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCompanySettings } from '@/shared/contexts/CompanySettingsContext';
import { Menu, X, Home, Users, Briefcase, DollarSign, Calendar, BarChart2, Settings, FileText, UserPlus, Award } from 'lucide-react';
import clsx from 'clsx';

const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:3333';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isSidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, isSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center py-2 px-4 rounded-lg transition-colors duration-200',
        isActive ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white',
        !isSidebarOpen && 'justify-center'
      )}
      title={!isSidebarOpen ? text : undefined}
      aria-label={text}
    >
      {icon}
      {isSidebarOpen && <span className="ml-3 text-sm font-medium">{text}</span>}
    </Link>
  );
};

const DashboardLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { user, logout, loading } = useAuth();
  const { settings, loading: settingsLoading } = useCompanySettings();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const avatarUrl = useMemo(() => {
    const directUrl = user?.avatarUrl;
    if (directUrl) {
      return directUrl.startsWith('http') ? directUrl : `${API_URL}${directUrl}`;
    }
    const employeeUrl = user?.employeeDetails?.avatarUrl;
    if (employeeUrl) {
      return employeeUrl.startsWith('http') ? employeeUrl : `${API_URL}${employeeUrl}`;
    }
    return `${API_URL}/avatars/default-avatar.jpg`;
  }, [user]);

  const handleToggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const allNavItems = [
    { to: '/dashboard', icon: <Home size={20} />, text: 'Dashboard', roles: ['admin', 'employee'] },
    { to: '/dashboard/pegawai', icon: <Users size={20} />, text: 'Manajemen Pegawai', roles: ['admin'] },
    { to: '/dashboard/absensi', icon: <Calendar size={20} />, text: 'Manajemen Absensi', roles: ['admin'] },
    { to: '/dashboard/cuti', icon: <Briefcase size={20} />, text: 'Manajemen Cuti', roles: ['admin'] },
    { to: '/dashboard/penggajian', icon: <DollarSign size={20} />, text: 'Manajemen Penggajian', roles: ['admin'] },
    { to: '/dashboard/kontrak', icon: <FileText size={20} />, text: 'Manajemen Kontrak', roles: ['admin'] },
    { to: '/dashboard/kinerja', icon: <BarChart2 size={20} />, text: 'Manajemen Kinerja', roles: ['admin'] },
    { to: '/dashboard/perekrutan', icon: <UserPlus size={20} />, text: 'Perekrutan', roles: ['admin'] },
    { to: '/dashboard/pelatihan', icon: <Award size={20} />, text: 'Manajemen Pelatihan', roles: ['admin'] },
        { to: '/dashboard/laporan', icon: <FileText size={20} />, text: 'Laporan', roles: ['admin'] },
        { to: '/dashboard/perubahan-data', icon: <FileText size={20} />, text: 'Perubahan Data', roles: ['admin'] },
        { to: '/dashboard/pengaturan', icon: <Settings size={20} />, text: 'Pengaturan', roles: ['admin'] }, 
        { to: `/dashboard/pegawai/${user?.employeeId}` , icon: <Users size={20}/>, text: 'Profil Saya', roles: ['employee'] },
    { to: '/dashboard/absensi-saya', icon: <Calendar size={20} />, text: 'Absensi Saya', roles: ['employee'] },
    { to: '/dashboard/cuti-saya', icon: <Briefcase size={20} />, text: 'Cuti Saya', roles: ['employee'] },
    { to: '/dashboard/penggajian-saya', icon: <DollarSign size={20} />, text: 'Gaji Saya', roles: ['employee'] },
    { to: '/dashboard/kinerja-saya', icon: <BarChart2 size={20} />, text: 'Kinerja Saya', roles: ['employee'] },
    { to: '/dashboard/pelatihan-saya', icon: <Award size={20} />, text: 'Pelatihan Saya', roles: ['employee'] },
  ];

  const navItems = useMemo(() => {
    return allNavItems.filter(item => user?.role && item.roles.includes(user.role));
  }, [allNavItems, user?.role]);

  if (loading || settingsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-primary-800 transition-all duration-300 shadow-soft-shadow overflow-y-auto',
          isSidebarOpen ? 'w-64' : 'w-20',
        )}
      >
        <div className="flex items-center justify-center h-auto bg-primary-900 text-white text-2xl font-bold border-b border-primary-700 py-2">
          {isSidebarOpen ? (
            <div className="text-center">
              {settings?.logo ? (
                  <img
                    className="h-12 w-auto mx-auto mb-1"
                    src={settings.logo}
                    alt={settings.companyName || 'Company Logo'}
                    title={settings.companyName || 'Company Logo'}
                  />
              ) : (
                <span className="text-xl">{settings?.companyName || 'Portal_SDM'}</span>
              )}
              {settings?.address && (
                <p className="text-xs text-primary-200 mt-1">{settings.address}</p>
              )}
            </div>
          ) : (
            <span title={settings?.companyName || 'Portal_SDM'}>H</span>
          )}
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />
          ))}
        </nav>
     
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={logout}
            className={clsx(
              'flex items-center w-full py-2 px-4 rounded-lg text-gray-300 hover:bg-primary-600 hover:text-white transition-colors duration-200',
              !isSidebarOpen && 'justify-center'
            )}
            title="Logout"
            aria-label="Logout"
          >
            <X size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={clsx(
          'flex-1 flex flex-col transition-all duration-300 bg-neutral-50 dark:bg-neutral-900',
          isSidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 shadow-soft-shadow z-40">
          <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-300 focus:outline-none" title="Toggle Sidebar" aria-label="Buka/Tutup Sidebar">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.companyName || 'Dashboard'}
              </h1>
              {settings?.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {settings.address}
                </p>
              )}
            </div>
          <div className="relative">
            <button
              onClick={handleToggleUserMenu}
              className="flex items-center space-x-2 focus:outline-none"
              title="Menu Pengguna"
              aria-label="Menu Pengguna"
            >
              <img
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                src={avatarUrl}
                alt="User Avatar"
              />
              <span className="text-sm font-medium hidden md:block text-gray-700 dark:text-gray-200">{user?.name || 'Guest'}</span>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-soft-shadow py-1 z-50">
                                <Link to={`/dashboard/pegawai/${user?.employeeId}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                                {user?.role === 'admin' && (
                                  <Link to="/dashboard/pengaturan" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Settings</Link>
                                )}
                                <button type="button" onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" title="Logout" aria-label="Logout">Logout</button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
