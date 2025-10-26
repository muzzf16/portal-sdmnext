// src/features/01-pegawai/components/__tests__/DaftarPegawai.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DaftarPegawai from '../DaftarPegawai';
import { usePegawaiList, useDeletePegawai } from '../../hooks/usePegawaiQuery';

// Mock the API hooks
jest.mock('../../hooks/usePegawaiQuery', () => ({
  usePegawaiList: jest.fn(),
  useDeletePegawai: jest.fn(),
}));

const mockPegawai = [
  {
    id: 1,
    nip: '123456',
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Software Engineer',
    department: 'IT',
    joinDate: '2023-01-01',
  },
  {
    id: 2,
    nip: '123457',
    name: 'Jane Smith',
    email: 'jane@example.com',
    position: 'Product Manager',
    department: 'Product',
    joinDate: '2023-02-01',
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

    // Check if table rows are rendered
    expect(screen.getAllByRole('row')).toHaveLength(mockPegawai.length + 1); // +1 for header
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
});