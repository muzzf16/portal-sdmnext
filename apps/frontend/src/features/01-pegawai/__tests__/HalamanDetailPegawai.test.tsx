// src/features/01-pegawai/__tests__/HalamanDetailPegawai.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HalamanDetailPegawai from '../pages/HalamanDetailPegawai';
import { usePegawai } from '../hooks/usePegawai';
import { useRiwayatJabatan } from '../hooks/useRiwayatJabatan';
import { usePelatihan } from '../hooks/usePelatihan';

// Mock the API hooks
jest.mock('../hooks/usePegawai', () => ({
  usePegawai: jest.fn(),
}));

jest.mock('../hooks/useRiwayatJabatan', () => ({
  useRiwayatJabatan: jest.fn(),
}));

jest.mock('../hooks/usePelatihan', () => ({
  usePelatihan: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Award: () => <div data-testid="award-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Printer: () => <div data-testid="printer-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  GraduationCap: () => <div data-testid="graduation-cap-icon" />,
  FileCertificate: () => <div data-testid="file-certificate-icon" />,
  Star: () => <div data-testid="star-icon" />,
}));

const mockPegawai = {
  id: 1,
  nip: '123456789',
  name: 'John Doe',
  email: 'john@example.com',
  position: 'Software Engineer',
  department: 'IT',
  joinDate: '2023-01-01',
  isActive: true,
  address: '123 Main St, City',
  phone: '+1234567890',
  pob: 'City',
  dob: '1990-01-01',
  religion: 'Religion',
  maritalStatus: 'Married',
  numberOfChildren: 2,
};

const mockRiwayatJabatan = [
  {
    id: 1,
    pegawai_id: 1,
    jabatan_lama: 'Junior Developer',
    jabatan_baru: 'Software Engineer',
    tanggal_perubahan: '2023-06-01',
  },
];

const mockPelatihan = [
  {
    id: 1,
    pegawai_id: 1,
    nama_pelatihan: 'Advanced React',
    penyelenggara: 'Tech Institute',
    tanggal_mulai: '2023-03-01',
    tanggal_selesai: '2023-03-05',
    nomor_sertifikat: 'TI-2023-001',
  },
];

describe('HalamanDetailPegawai Component', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    (usePegawai as jest.MockedFunction<any>).mockReturnValue({
      pegawai: mockPegawai,
      loading: false,
      error: null,
    });

    (useRiwayatJabatan as jest.MockedFunction<any>).mockReturnValue({
      riwayatJabatan: mockRiwayatJabatan,
      loading: false,
      error: null,
    });

    (usePelatihan as jest.MockedFunction<any>).mockReturnValue({
      pelatihan: mockPelatihan,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders employee detail page correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/pegawai/1']}>
          <Routes>
            <Route path="/dashboard/pegawai/:id" element={<HalamanDetailPegawai />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();
    });

    // Check if tabs are rendered
    expect(screen.getByText('Data Diri')).toBeInTheDocument();
    expect(screen.getByText('Riwayat Pekerjaan')).toBeInTheDocument();
    expect(screen.getByText('Sertifikat')).toBeInTheDocument();
    expect(screen.getByText('Kinerja')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    (usePegawai as jest.MockedFunction<any>).mockReturnValue({
      pegawai: null,
      loading: true,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/pegawai/1']}>
          <Routes>
            <Route path="/dashboard/pegawai/:id" element={<HalamanDetailPegawai />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    (usePegawai as jest.MockedFunction<any>).mockReturnValue({
      pegawai: null,
      loading: false,
      error: new Error('Failed to fetch employee'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/pegawai/1']}>
          <Routes>
            <Route path="/dashboard/pegawai/:id" element={<HalamanDetailPegawai />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('shows not found message when employee is not found', () => {
    (usePegawai as jest.MockedFunction<any>).mockReturnValue({
      pegawai: null,
      loading: false,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/pegawai/999']}>
          <Routes>
            <Route path="/dashboard/pegawai/:id" element={<HalamanDetailPegawai />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Pegawai tidak ditemukan')).toBeInTheDocument();
  });
});