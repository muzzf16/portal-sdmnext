import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '@/app/hooks/useSidebar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCompanySettings } from '@/shared/contexts/CompanySettingsContext';
import {
  Menu, X, Home, Users, Briefcase, DollarSign, Calendar,
  BarChart2, Settings, FileText, UserPlus, Award,
  ChevronLeft, ChevronRight, LogOut, User, Bell
} from 'lucide-react';
import clsx from 'clsx';

/* ─── Types ─── */
interface NavSection {
  label: string;
  items: NavItemConfig[];
}

interface NavItemConfig {
  to: string;
  icon: React.ReactNode;
  text: string;
  roles: string[];
}

/* ─── Nav Item Component ─── */
const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  text: string;
  isSidebarOpen: boolean;
}> = ({ to, icon, text, isSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to ||
    (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={clsx(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
        isActive
          ? 'nav-active text-white shadow-inner-glow'
          : 'text-primary-200/80 hover:text-white hover:bg-white/[0.06]',
        !isSidebarOpen && 'justify-center px-0'
      )}
      title={!isSidebarOpen ? text : undefined}
      aria-label={text}
    >
      <span className={clsx(
        'flex-shrink-0 transition-transform duration-200',
        isActive ? 'text-accent-400' : 'text-primary-300/70 group-hover:text-primary-200',
        !isActive && 'group-hover:scale-110'
      )}>
        {icon}
      </span>
      {isSidebarOpen && (
        <span className="truncate animate-fadeIn">{text}</span>
      )}
      {isActive && isSidebarOpen && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse-soft" />
      )}
    </Link>
  );
};

/* ─── Section Label ─── */
const SectionLabel: React.FC<{ label: string; isOpen: boolean }> = ({ label, isOpen }) => {
  if (!isOpen) return <div className="divider-gradient mx-3 my-3" />;
  return (
    <div className="px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-400/60">
        {label}
      </span>
    </div>
  );
};

/* ─── Main Layout ─── */
const DashboardLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { user, logout, loading } = useAuth();
  const { settings, loading: settingsLoading } = useCompanySettings();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const avatarUrl = useMemo(() => {
    const directUrl = user?.avatarUrl;
    if (directUrl) return directUrl.startsWith('http') ? directUrl : `/api${directUrl}`;
    const employeeUrl = user?.employeeDetails?.avatarUrl;
    if (employeeUrl) return employeeUrl.startsWith('http') ? employeeUrl : `/api${employeeUrl}`;
    return `/api/avatars/default-avatar.jpg`;
  }, [user]);

  const handleToggleUserMenu = useCallback(() => setIsUserMenuOpen(p => !p), []);

  /* ─── Navigation Config by Section ─── */
  const navSections: NavSection[] = useMemo(() => [
    {
      label: 'Utama',
      items: [
        { to: '/dashboard', icon: <Home size={18} />, text: 'Dashboard', roles: ['admin', 'employee', 'supervisor'] },
      ],
    },
    {
      label: 'Sumber Daya Manusia',
      items: [
        { to: '/dashboard/pegawai', icon: <Users size={18} />, text: 'Manajemen Pegawai', roles: ['admin'] },
        { to: '/dashboard/struktur-organisasi', icon: <BarChart2 size={18} />, text: 'Struktur Organisasi', roles: ['admin'] },
        { to: '/dashboard/absensi', icon: <Calendar size={18} />, text: 'Manajemen Absensi', roles: ['admin'] },
        { to: '/dashboard/cuti', icon: <Briefcase size={18} />, text: 'Manajemen Cuti', roles: ['admin'] },
        { to: '/dashboard/penggajian', icon: <DollarSign size={18} />, text: 'Manajemen Penggajian', roles: ['admin'] },
        { to: '/dashboard/kontrak', icon: <FileText size={18} />, text: 'Manajemen Kontrak', roles: ['admin'] },
      ],
    },
    {
      label: 'Kinerja & Pengembangan',
      items: [
        { to: '/dashboard/kinerja', icon: <BarChart2 size={18} />, text: 'Manajemen Kinerja', roles: ['admin', 'supervisor', 'employee'] },
        { to: '/dashboard/perekrutan', icon: <UserPlus size={18} />, text: 'Perekrutan', roles: ['admin'] },
        { to: '/dashboard/pelatihan', icon: <Award size={18} />, text: 'Manajemen Pelatihan', roles: ['admin'] },
      ],
    },
    {
      label: 'Laporan & Sistem',
      items: [
        { to: '/dashboard/laporan', icon: <FileText size={18} />, text: 'Laporan', roles: ['admin'] },
        { to: '/dashboard/perubahan-data', icon: <FileText size={18} />, text: 'Perubahan Data', roles: ['admin'] },
        { to: '/dashboard/pengaturan', icon: <Settings size={18} />, text: 'Pengaturan', roles: ['admin'] },
      ],
    },
    {
      label: 'Menu Saya',
      items: [
        { to: `/dashboard/pegawai/${user?.employeeId}`, icon: <Users size={18} />, text: 'Profil Saya', roles: ['employee', 'supervisor'] },
        { to: '/dashboard/absensi-saya', icon: <Calendar size={18} />, text: 'Absensi Saya', roles: ['employee', 'supervisor'] },
        { to: '/dashboard/cuti-saya', icon: <Briefcase size={18} />, text: 'Cuti Saya', roles: ['employee', 'supervisor'] },
        { to: '/dashboard/penggajian-saya', icon: <DollarSign size={18} />, text: 'Gaji Saya', roles: ['employee', 'supervisor'] },
        { to: '/dashboard/kinerja-saya', icon: <BarChart2 size={18} />, text: 'Kinerja Saya', roles: ['employee', 'supervisor'] },
        { to: '/dashboard/pelatihan-saya', icon: <Award size={18} />, text: 'Pelatihan Saya', roles: ['employee', 'supervisor'] },
      ],
    },
  ], [user?.employeeId]);

  // Filter sections to include only visible items for the user's role
  const visibleSections = useMemo(() => {
    return navSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => user?.role && item.roles.includes(user.role)),
      }))
      .filter(section => section.items.length > 0);
  }, [navSections, user?.role]);

  /* ─── Loading State ─── */
  if (loading || settingsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-neutral-200 dark:border-neutral-700" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-primary-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-neutral-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      {/* ═══ Sidebar ═══ */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col gradient-sidebar shadow-sidebar transition-all duration-300 ease-smooth',
          isSidebarOpen ? 'w-64' : 'w-[68px]',
        )}
      >
        {/* Logo Area */}
        <div className={clsx(
          'flex items-center h-16 border-b border-white/[0.06] px-4',
          isSidebarOpen ? 'justify-between' : 'justify-center'
        )}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 min-w-0 animate-fadeIn">
              {settings?.logo ? (
                <img
                  className="h-9 w-9 rounded-lg object-contain flex-shrink-0 ring-1 ring-white/10"
                  src={settings.logo}
                  alt={settings.companyName || 'Logo'}
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {settings?.companyName || 'Portal SDM'}
                </p>
                {settings?.address && (
                  <p className="text-primary-300/50 text-[10px] truncate">{settings.address}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white text-sm font-bold" title={settings?.companyName || 'Portal SDM'}>P</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin space-y-0.5">
          {visibleSections.map((section, idx) => (
            <div key={idx}>
              <SectionLabel label={section.label} isOpen={isSidebarOpen} />
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavItem key={item.to} {...item} isSidebarOpen={isSidebarOpen} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-primary-300/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200 mb-1',
              !isSidebarOpen && 'justify-center px-0'
            )}
            title={isSidebarOpen ? 'Lipat Sidebar' : 'Perbesar Sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {isSidebarOpen && <span className="text-sm">Lipat Menu</span>}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-300/70 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200',
              !isSidebarOpen && 'justify-center px-0'
            )}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content Area ═══ */}
      <div
        className={clsx(
          'flex-1 flex flex-col transition-all duration-300 ease-smooth min-h-screen',
          isSidebarOpen ? 'ml-64' : 'ml-[68px]'
        )}
      >
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-b border-neutral-200/60 dark:border-neutral-700/40">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="Toggle Menu"
              aria-label="Buka/Tutup Sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {settings?.companyName || 'Dashboard'}
              </h1>
              {settings?.address && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:block">
                  {settings.address}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification placeholder */}
            <button
              className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              title="Notifikasi"
            >
              <Bell size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={handleToggleUserMenu}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                title="Menu Pengguna"
                aria-label="Menu Pengguna"
              >
                <img
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-100 dark:ring-primary-900/50"
                  src={avatarUrl}
                  alt="Avatar"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 leading-tight">
                    {user?.name || 'Guest'}
                  </p>
                  <p className="text-[10px] text-neutral-400 capitalize">{user?.role}</p>
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-800 rounded-xl shadow-elevated border border-neutral-200/60 dark:border-neutral-700/40 py-1.5 z-50 animate-scaleIn origin-top-right">
                    <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-700 mb-1">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user?.name}</p>
                      <p className="text-xs text-neutral-400">{user?.email}</p>
                    </div>
                    <Link
                      to={`/dashboard/pegawai/${user?.employeeId}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <User size={15} />
                      Profil Saya
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/dashboard/pengaturan"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <Settings size={15} />
                        Pengaturan
                      </Link>
                    )}
                    <div className="border-t border-neutral-100 dark:border-neutral-700 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-6 overflow-y-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
