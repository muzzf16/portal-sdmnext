import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Role } from '../types';

interface HeaderProps {
  userRole: Role;
  userName: string;
  onLogout: () => void;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({ userRole, userName, onLogout, notificationCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = userRole === Role.ADMIN 
    ? [
        { name: 'Dashboard', path: '.' },
        { name: 'Karyawan', path: 'employees' },
        { name: 'Cuti', path: 'leaves' },
        { name: 'Presensi', path: 'attendance' },
        { name: 'Gaji & payslip', path: 'payroll' },
        { name: 'PenilaianKinerja', path: 'performance' },
        { name: 'Laporan', href: 'reports' },
        { name: 'Kontrak', path: 'kontrak' },
        { name: 'Rekrutmen', path: 'rekrutmen' },
        { name: 'Onboarding', path: 'onboarding' },
        { name: 'Notifikasi', path: 'notifications' },
        { name: 'Pengaturan', path: 'settings' },
      ]
    : [
        { name: 'Dashboard', path: '.' },
        { name: 'Profil', path: 'profile' },
        { name: 'Cuti Saya', path: 'my-leaves' },
        { name: 'Presensi Saya', path: 'my-attendance' },
        { name: 'Gaji Saya', path: 'my-payroll' },
        { name: 'Kinerja Saya', path: 'my-performance' },
        { name: 'Notifikasi', path: 'notifications' },
      ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary-darker shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-secondary-orange p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="ml-3 text-2xl font-bold text-white">PT BPR BAPERA BATANG</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path === '.' ? '/dashboard' : `/dashboard/${link.path}`}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  (link.path === '.' ? location.pathname === '/dashboard' : location.pathname.endsWith(link.path))
                    ? 'bg-secondary-orange text-white'
                    : 'text-neutral-medium hover:bg-primary-dark hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="hidden md:block md:ml-4">
              <div className="relative flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{userName}</p>
                  <p className="text-sm text-neutral-medium">{userRole === Role.ADMIN ? 'Admin' : 'Karyawan'}</p>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center">
              <Link 
                to="/dashboard/notifications" 
                className="md:hidden p-2 rounded-full text-neutral-medium hover:text-white hover:bg-primary-dark focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="md:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-neutral-medium hover:text-white hover:bg-primary-dark focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logout button - visible on all devices */}
            <div className="relative ml-4">
              <Link 
                to="/dashboard/notifications" 
                className="p-2 rounded-full text-neutral-medium hover:text-white hover:bg-primary-dark focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 p-2 rounded-full text-neutral-medium hover:text-white hover:bg-primary-dark focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-darker">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path === '.' ? '/dashboard' : `/dashboard/${link.path}`}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  (link.path === '.' ? location.pathname === '/dashboard' : location.pathname.endsWith(link.path))
                    ? 'bg-secondary-orange text-white'
                    : 'text-neutral-medium hover:bg-primary-dark hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-primary-dark">
            <div className="flex items-center px-5">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <div className="ml-3">
                <div className="text-base font-medium text-white">{userName}</div>
                <div className="text-sm font-medium text-neutral-medium">{userRole === Role.ADMIN ? 'Admin' : 'Karyawan'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;