// src/features/01-pegawai/__tests__/DaftarPegawai.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DaftarPegawai from '../components/DaftarPegawai';
import { usePegawaiList, useDeletePegawai } from '../hooks/usePegawaiQuery';

// Mock the API hooks
jest.mock('../hooks/usePegawaiQuery', () => ({
  usePegawaiList: jest.fn(),
  useDeletePegawai: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Award: () => <div data-testid="award-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

const mockPegawai = [
  {
    id: 1,
    nip: '123456789',
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Software Engineer',
    department: 'IT',
    joinDate: '2023-01-01',
    isActive: true,
    avatarUrl: '',
  },
  {
    id: 2,
    nip: '987654321',
    name: 'Jane Smith',
    email: 'jane@example.com',
    position: 'Product Manager',
    department: 'Product',
    joinDate: '2023-02-01',
    isActive: false,
    avatarUrl: '',
  },
];

describe('DaftarPegawai Component', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    (usePegawaiList as jest.MockedFunction<any>).mockReturnValue({
      data: mockPegawai,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useDeletePegawai as jest.MockedFunction<any>).mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders employee list correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DaftarPegawai />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check if employee cards are rendered
    expect(screen.getAllByText('Lihat')).toHaveLength(mockPegawai.length);
  });

  it('shows loading state when data is loading', () => {
    (usePegawaiList as jest.MockedFunction<any>).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DaftarPegawai />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    (usePegawaiList as jest.MockedFunction<any>).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch employees'),
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DaftarPegawai />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('shows empty state when no employees', () => {
    (usePegawaiList as jest.MockedFunction<any>).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DaftarPegawai />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Tidak ada data pegawai')).toBeInTheDocument();
  });
});