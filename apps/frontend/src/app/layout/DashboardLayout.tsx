import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '@/app/hooks/useSidebar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Menu, X, Home, Users, Briefcase, DollarSign, Calendar, BarChart2, Settings, FileText, UserPlus, Award } from 'lucide-react';
import clsx from 'clsx';

const VITE_API_URL = 'http://localhost:3333';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isSidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, isSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to; // Simplified active state for now
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center py-2 px-4 rounded-lg transition-colors duration-200',
        isActive ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white',
        !isSidebarOpen && 'justify-center'
      )}
    >
      {icon}
      {isSidebarOpen && <span className="ml-3 text-sm font-medium">{text}</span>}
    </Link>
  );
};

const DashboardLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith('http')) {
        return user.avatarUrl;
      }
      return `${VITE_API_URL}${user.avatarUrl}`;
    }
    return `${VITE_API_URL}/avatars/default-avatar.jpg`;
  };

  // Define base navigation items
  const allNavItems = [
    // Shared
    { to: '/dashboard', icon: <Home size={20} />, text: 'Dashboard', roles: ['admin', 'employee'] },
   

    // Admin Only
    { to: '/dashboard/pegawai', icon: <Users size={20} />, text: 'Manajemen Pegawai', roles: ['admin'] },
    { to: '/dashboard/absensi', icon: <Calendar size={20} />, text: 'Manajemen Absensi', roles: ['admin'] },
    { to: '/dashboard/cuti', icon: <Briefcase size={20} />, text: 'Manajemen Cuti', roles: ['admin'] },
    { to: '/dashboard/penggajian', icon: <DollarSign size={20} />, text: 'Manajemen Penggajian', roles: ['admin'] },
    { to: '/dashboard/kontrak', icon: <FileText size={20} />, text: 'Manajemen Kontrak', roles: ['admin'] },
    { to: '/dashboard/kinerja', icon: <BarChart2 size={20} />, text: 'Manajemen Kinerja', roles: ['admin'] },
    { to: '/dashboard/perekrutan', icon: <UserPlus size={20} />, text: 'Perekrutan', roles: ['admin'] },
    { to: '/dashboard/pelatihan', icon: <Award size={20} />, text: 'Manajemen Pelatihan', roles: ['admin'] },
    { to: '/dashboard/laporan', icon: <FileText size={20} />, text: 'Laporan', roles: ['admin'] },
    { to: '/dashboard/pengaturan', icon: <Settings size={20} />, text: 'Pengaturan', roles: ['admin', 'employee'] }, 
    // Employee Specific (paths are dynamic)
    { to: `/dashboard/pegawai/${user?.employeeId}` , icon: <Users size={20}/>, text: 'Profil Saya', roles: ['employee'] },
    { to: '/dashboard/absensi-saya', icon: <Calendar size={20} />, text: 'Absensi Saya', roles: ['employee'] },
    { to: '/dashboard/cuti-saya', icon: <Briefcase size={20} />, text: 'Cuti Saya', roles: ['employee'] },
    { to: '/dashboard/penggajian-saya', icon: <DollarSign size={20} />, text: 'Gaji Saya', roles: ['employee'] },
    { to: '/dashboard/kinerja-saya', icon: <BarChart2 size={20} />, text: 'Kinerja Saya', roles: ['employee'] },
    { to: '/dashboard/pelatihan-saya', icon: <Award size={20} />, text: 'Pelatihan Saya', roles: ['employee'] },
  ];

  const navItems = allNavItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-primary-800 transition-all duration-300 shadow-soft-shadow',
          isSidebarOpen ? 'w-64' : 'w-20',
        )}
      >
        <div className="flex items-center justify-center h-16 bg-primary-900 text-white text-2xl font-bold border-b border-primary-700">
          {isSidebarOpen ? 'Portal_SDM' : 'H'}
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
          >
            <X size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={clsx(
          'flex-1 flex flex-col transition-all duration-300 bg-neutral-50 dark:bg-neutral-900',
          isSidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 shadow-soft-shadow z-40">
          <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-300 focus:outline-none">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">PT BPR BAPERA BATANG</h1> {/* Placeholder for page title */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                src={getAvatarUrl()}
                alt="User Avatar"
              />
              <span className="text-sm font-medium hidden md:block text-gray-700 dark:text-gray-200">{user?.name || 'Guest'}</span>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-soft-shadow py-1 z-50">
                <Link to={`/dashboard/pegawai/${user?.employeeId}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                <Link to="/dashboard/pengaturan" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Settings</Link>
                <a href="#" onClick={logout} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</a>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;