// src/features/01-pegawai/hooks/usePegawaiQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPegawai, getPegawaiById, createPegawai, updatePegawai, deletePegawai } from '../api/employeeApi';
import { Pegawai } from '../types';

const VITE_API_URL = import.meta.env.VITE_API_BASE || '';

const constructAvatarUrl = (pegawaiData: Pegawai): Pegawai => {
  if (pegawaiData && pegawaiData.avatarUrl && !pegawaiData.avatarUrl.startsWith('http')) {
    return { ...pegawaiData, avatarUrl: `${VITE_API_URL}${pegawaiData.avatarUrl}` };
  }
  return pegawaiData;
};

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
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data || [];
      }
      return response || [];
    },
    select: (data: Pegawai[]) => data.map(constructAvatarUrl),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePegawai = (id: string) => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await getPegawaiById(id);
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    },
    select: (data: Pegawai) => constructAvatarUrl(data),
    enabled: !!id,
  });
};

// Mutations
export const useCreatePegawai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pegawai: Omit<Pegawai, 'id'>) => {
      const response = await createPegawai(pegawai);
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdatePegawai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pegawai> }) => {
      const response = await updatePegawai(id, data);
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(EMPLOYEE_QUERY_KEYS.detail(variables.id), variables.data);
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};

export const useDeletePegawai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePegawai(id);
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.lists() });
    },
  });
};