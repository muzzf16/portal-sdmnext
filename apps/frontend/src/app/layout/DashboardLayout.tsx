import React, { useCallback, useMemo, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/app/hooks/useSidebar';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  BarChart, 
  UserCheck, 
  Bell, 
  Settings, 
  File,
  Building,
  Database,
  Download,
  Upload,
  Key
} from 'lucide-react';
import clsx from 'clsx';

// Define types for better type safety
interface NavItem {
  to: string;
  text: string;
  icon: React.ComponentType<any>; // Use any to avoid type conflicts with Lucide icons
}

const DashboardLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const skipToMainContentRef = useRef<HTMLAnchorElement>(null);

  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo<NavItem[]>(() => [
    { to: "/dashboard/admin", text: t('dashboard.title'), icon: Home },
    { to: "/dashboard/pegawai", text: t('employee.title'), icon: Users },
    { to: "/dashboard/absensi", text: t('attendance.title'), icon: Clock },
    { to: "/dashboard/cuti", text: t('leave.title'), icon: Calendar },
    { to: "/dashboard/penggajian", text: t('payroll.title'), icon: DollarSign },
    { to: "/dashboard/kontrak", text: "Kontrak", icon: FileText },
    { to: "/dashboard/kinerja", text: "Kinerja", icon: BarChart },
    { to: "/dashboard/perekrutan", text: "Perekrutan", icon: UserCheck },
    { to: "/dashboard/laporan", text: "Laporan", icon: File },
    { to: "/dashboard/notifikasi", text: "Notifikasi", icon: Bell },
    { to: "/dashboard/pengaturan", text: t('settings.title'), icon: Settings },
  ], [t]);

  const handleLogout = useCallback(() => {
    if (window.confirm(t('auth.logoutConfirm') || 'Are you sure you want to logout?')) {
      logout();
    }
  }, [logout, t]);

  // Memoize active nav item calculation
  const activeNavItem = useMemo(() => {
    return navItems.find(item => location.pathname.startsWith(item.to));
  }, [location.pathname, navItems]);

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900" role="main" aria-label="Dashboard Layout">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content"
        ref={skipToMainContentRef}
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:text-primary-800 z-50"
      >
        {t('accessibility.skipToMainContent') || 'Skip to main content'}
      </a>
      
      {/* Sidebar */}
      <aside 
        className={clsx(
          "bg-primary-800 text-white flex flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-16"
        )}
        aria-label={isSidebarOpen ? "Main navigation menu" : "Navigation"}
      >
        <div className="p-4 flex items-center justify-center">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-sans font-bold" id="app-title">SDM BPRBAPERA BATANG</h1>
          ) : (
            <span className="text-2xl font-sans font-bold" aria-label="SDM Application">SDM</span>
          )}
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-lg transition-colors duration-200",
                  isActive 
                    ? "bg-primary-700 text-white dark:bg-primary-600" 
                    : "text-gray-300 hover:bg-primary-700 hover:text-white dark:hover:bg-neutral-700"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} className="min-w-[20px]" aria-hidden="true" />
                {isSidebarOpen && <span className="ml-3 font-sans">{item.text}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-primary-800"
            aria-label={isSidebarOpen ? t('auth.logout') : "Logout"}
          >
            <LogOut size={18} className={clsx("transition-all", isSidebarOpen ? "mr-2" : "")} aria-hidden="true" />
            {isSidebarOpen && <span className="font-sans">{t('auth.logout')}</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-neutral-800 shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="text-gray-600 dark:text-gray-300 focus:outline-none mr-4 focus:ring-2 focus:ring-primary-500 rounded p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-sans font-semibold text-gray-800 dark:text-white" id="page-title">
              {activeNavItem?.text || t('dashboard.title')}
            </h1>
          </div>
          
          {/* User profile and actions */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              aria-label={t('notifications.title') || "Notifications"}
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              aria-label={t('settings.title') || "Settings"}
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                <User size={16} className="text-indigo-800 dark:text-indigo-200" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-sans hidden md:inline">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>
        
        <main 
          className="flex-1 p-4 md:p-8 overflow-y-auto font-sans text-gray-900 dark:text-gray-100" 
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;