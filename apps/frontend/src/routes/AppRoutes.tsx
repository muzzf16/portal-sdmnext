import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from '../app/layout/DashboardLayout';

// Landing
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));

// Auth
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const Daftar = lazy(() => import('../features/autentikasi/pages/Daftar'));
const LupaKataSandi = lazy(() => import('../features/autentikasi/pages/LupaKataSandi'));

// Dashboard
const AdminDashboard = lazy(() => import('../features/dasbor/pages/AdminDashboard'));
const SupervisorDashboard = lazy(() => import('../features/dasbor/pages/SupervisorDashboard'));
const EmployeeDashboard = lazy(() => import('../features/dasbor/pages/EmployeeDashboard'));
const DashboardIndex = lazy(() => import('../features/dasbor/pages/DashboardIndex'));
const ProfilAdminPage = lazy(() => import('../features/dasbor/pages/ProfilAdminPage'));

// Employee
const HalamanPegawai = lazy(() => import('../features/01-pegawai/pages/HalamanPegawai'));
const EmployeeDetailView = lazy(() => import('../features/01-pegawai/pages/EmployeeDetailView'));
const HalamanRiwayatJabatanPegawai = lazy(() => import('../features/01-pegawai/pages/HalamanRiwayatJabatanPegawai'));
const HalamanPelatihanPegawai = lazy(() => import('../features/01-pegawai/pages/HalamanPelatihanPegawai'));
const HalamanOrientasiPegawai = lazy(() => import('../features/01-pegawai/pages/HalamanOrientasiPegawai'));
const StrukturOrganisasiPage = lazy(() => import('../features/01-pegawai/pages/StrukturOrganisasiPage'));

// Attendance
const HalamanAbsensi = lazy(() => import('../features/02-absensi/pages/HalamanAbsensi'));
const HalamanAbsensiSaya = lazy(() => import('../features/02-absensi/pages/HalamanAbsensiSaya'));
const HalamanLembur = lazy(() => import('../features/02-absensi/pages/HalamanLembur'));
const HalamanLemburSaya = lazy(() => import('../features/02-absensi/pages/HalamanLemburSaya'));


// Leave
const HalamanCuti = lazy(() => import('../features/03-cuti/pages/HalamanCuti'));
const HalamanCutiSaya = lazy(() => import('../features/03-cuti/pages/HalamanCutiSaya'));

// Payroll
const HalamanPenggajian = lazy(() => import('../features/04-penggajian/pages/HalamanPenggajian'));
const HalamanPenggajianSaya = lazy(() => import('../features/04-penggajian/pages/HalamanPenggajianSaya'));
const HalamanDetailPenggajian = lazy(() => import('../features/04-penggajian/pages/HalamanDetailPenggajian'));

// Contract
const HalamanKontrak = lazy(() => import('../features/05-kontrak/pages/HalamanKontrak'));
const HalamanDetailKontrak = lazy(() => import('../features/05-kontrak/pages/HalamanDetailKontrak'));

// Performance
const ManajemenKinerjaPage = lazy(() => import('../features/06-kinerja/pages/ManajemenKinerjaPage'));
const HalamanKinerjaSaya = lazy(() => import('../features/06-kinerja/pages/HalamanKinerjaSaya'));
const HalamanDetailKinerja = lazy(() => import('../features/06-kinerja/pages/HalamanDetailKinerja'));
const LogAktivitasWlaPage = lazy(() => import('../features/06-kinerja/pages/LogAktivitasWlaPage'));
const AdminWlaSummaryPage = lazy(() => import('../features/06-kinerja/pages/AdminWlaSummaryPage'));
const KreditMonitoringPage = lazy(() => import('../features/06-kinerja/pages/KreditMonitoringPage'));

// Recruitment
const HalamanPerekrutan = lazy(() => import('../features/07-perekrutan/pages/HalamanPerekrutan'));

// Training
const HalamanPelatihan = lazy(() => import('../features/08-pelatihan/pages/HalamanPelatihan'));

const PelatihanSaya = lazy(() => import('../features/08-pelatihan/pages/PelatihanSaya'));

// Onboarding
const HalamanOrientasi = lazy(() => import('../features/orientasi/pages/HalamanOrientasi'));

// Reports
const HalamanLaporan = lazy(() => import('../features/09-laporan/pages/HalamanLaporan'));

// Notifications
const HalamanNotifikasi = lazy(() => import('../features/10-notifikasi/pages/HalamanNotifikasi'));

// Settings
const HalamanPengaturan = lazy(() => import('../features/pengaturan/pages/HalamanPengaturan'));
const HalamanPerubahanData = lazy(() => import('../features/pengaturan/pages/HalamanPerubahanData'));
const HalamanBackup = lazy(() => import('../features/pengaturan/pages/HalamanBackup'));
const HalamanAuditLog = lazy(() => import('../features/audit-log/pages/HalamanAuditLog'));

// Private Route
import PrivateRoute from '../shared/components/PrivateRoute';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LandingPage />
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LoginPage />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Daftar />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LupaKataSandi />
        </Suspense>
      } />
      <Route path="/landing" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LandingPage />
        </Suspense>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardIndex />
          </Suspense>
        } />
        <Route path="admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="supervisor" element={
          <PrivateRoute allowedRoles={['supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <SupervisorDashboard />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="employee" element={
          <PrivateRoute allowedRoles={['employee']}>
            <Suspense fallback={<LoadingSpinner />}>
              <EmployeeDashboard />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pegawai" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPegawai />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="profil-admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilAdminPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="struktur-organisasi" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <StrukturOrganisasiPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pegawai/:id" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <EmployeeDetailView />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pegawai/:id/riwayat-jabatan" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanRiwayatJabatanPegawai />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pegawai/:id/pelatihan" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPelatihanPegawai />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pegawai/:id/orientasi" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanOrientasiPegawai />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="absensi" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanAbsensi />
            </Suspense>
          </PrivateRoute>
        } />

        <Route path="cuti" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanCuti />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="penggajian" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPenggajian />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="penggajian/:id" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanDetailPenggajian />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="kontrak" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanKontrak />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="kontrak/:id" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanDetailKontrak />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="kinerja" element={
          <PrivateRoute allowedRoles={['admin', 'supervisor', 'employee']}>
            <Suspense fallback={<LoadingSpinner />}>
              <ManajemenKinerjaPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="kinerja/:id" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanDetailKinerja />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="log-aktivitas" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LogAktivitasWlaPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="wla-summary" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminWlaSummaryPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="monitoring-kredit" element={
          <PrivateRoute allowedRoles={['admin', 'supervisor', 'employee']}>
            <Suspense fallback={<LoadingSpinner />}>
              <KreditMonitoringPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="perekrutan" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPerekrutan />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pelatihan" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPelatihan />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="laporan" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanLaporan />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="notifikasi" element={
          <PrivateRoute allowedRoles={['admin', 'employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanNotifikasi />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="absensi-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanAbsensiSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="cuti-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanCutiSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="lembur-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanLemburSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="penggajian-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPenggajianSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="kinerja-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanKinerjaSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pelatihan-saya" element={
          <PrivateRoute allowedRoles={['employee', 'supervisor']}>
            <Suspense fallback={<LoadingSpinner />}>
              <PelatihanSaya />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="orientasi" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanOrientasi />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="lembur" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanLembur />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="pengaturan" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPengaturan />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="perubahan-data" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanPerubahanData />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="audit-log" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanAuditLog />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="backup" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <HalamanBackup />
            </Suspense>
          </PrivateRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;