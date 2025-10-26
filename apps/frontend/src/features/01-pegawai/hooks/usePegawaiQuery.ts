// src/features/01-pegawai/hooks/usePegawaiQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import employeeApi, { getPegawai, getPegawaiById, createPegawai, updatePegawai, deletePegawai } from '../api/employeeApi';
import { Pegawai } from '../types';

// Query keys
const EMPLOYEE_QUERY_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...EMPLOYEE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...EMPLOYEE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMPLOYEE_QUERY_KEYS.details(), id] as const,
};

// Queries
export const usePegawaiList = (filters?: any) => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await getPegawai();
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        return response.data || [];
      } else {
        // Response is raw data
        return response || [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePegawai = (id: string) => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await getPegawaiById(id);
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        return response.data;
      } else {
        // Response is raw data
        return response;
      }
    },
    enabled: !!id, // Only run query if id is provided
  });
};

// Mutations
export const useCreatePegawai = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pegawai: Omit<Pegawai, 'id'>) => {
      const response = await createPegawai(pegawai);
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        return response.data;
      } else {
        // Response is raw data
        return response;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdatePegawai = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pegawai> }) => {
      const response = await updatePegawai(id, data);
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        return response.data;
      } else {
        // Response is raw data
        return response;
      }
    },
    onSuccess: (_, variables) => {
      // Update the specific employee in the cache
      queryClient.setQueryData(EMPLOYEE_QUERY_KEYS.detail(variables.id), variables.data);
      // Invalidate the list to refetch
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};

export const useDeletePegawai = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePegawai(id);
      // Handle both standardized and raw response formats
      if (response && typeof response === 'object' && 'data' in response) {
        // Response is in standardized format
        return response.data;
      } else {
        // Response is raw data
        return response;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};