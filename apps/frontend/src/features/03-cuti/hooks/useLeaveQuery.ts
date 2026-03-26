import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  ajukanPermintaanCuti,
  getPermintaanCuti,
  getPermintaanCutiSaya,
  getSisaCuti,
  hapusPermintaanCuti,
  perbaruiStatusPermintaanCuti
} from '../api/cutiApi';
import type { Cuti, CutiFilters, LeaveBalanceSummary, LeaveStatus } from '../types';

export const LEAVE_QUERY_KEYS = {
  all: ['leave-requests'] as const,
  list: (filters?: CutiFilters) => [...LEAVE_QUERY_KEYS.all, 'list', filters ?? {}] as const,
  mine: (employeeId?: string) => [...LEAVE_QUERY_KEYS.all, 'mine', employeeId ?? 'anonymous'] as const,
  remainingBalance: (employeeId?: string) => ['leave-balance', employeeId ?? 'anonymous'] as const
};

export const useLeaveRequests = (filters?: CutiFilters) =>
  useQuery({
    queryKey: LEAVE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await getPermintaanCuti(filters);
      return response.data;
    },
    staleTime: 60 * 1000
  });

export const useMyLeaveRequests = () => {
  const { user } = useAuth();
  const employeeId = user?.employeeId ? String(user.employeeId) : undefined;

  return useQuery({
    queryKey: LEAVE_QUERY_KEYS.mine(employeeId),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getPermintaanCutiSaya(employeeId);
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 60 * 1000
  });
};

export const useLeaveBalance = (employeeId?: string) =>
  useQuery({
    queryKey: LEAVE_QUERY_KEYS.remainingBalance(employeeId),
    queryFn: async () => {
      if (!employeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await getSisaCuti(employeeId);
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 60 * 1000
  });

export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await ajukanPermintaanCuti(payload);
      return response.data;
    },
    onSuccess: (_, payload) => {
      const employeeId = payload.get('employeeId');
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });

      if (typeof employeeId === 'string' && employeeId) {
        queryClient.invalidateQueries({
          queryKey: LEAVE_QUERY_KEYS.mine(employeeId)
        });
        queryClient.invalidateQueries({
          queryKey: LEAVE_QUERY_KEYS.remainingBalance(employeeId)
        });
      }
    }
  });
};

interface UpdateLeaveStatusVariables {
  id: string;
  status: LeaveStatus;
  rejectionReason?: string;
}

export const useUpdateLeaveRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, rejectionReason }: UpdateLeaveStatusVariables) => {
      const response = await perbaruiStatusPermintaanCuti(id, status, rejectionReason);
      return response.data;
    },
    onSuccess: (updatedRequest: Cuti) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });
      if (updatedRequest?.employeeId) {
        queryClient.invalidateQueries({
          queryKey: LEAVE_QUERY_KEYS.mine(updatedRequest.employeeId)
        });
        queryClient.invalidateQueries({
          queryKey: LEAVE_QUERY_KEYS.remainingBalance(updatedRequest.employeeId)
        });
      }
    }
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await hapusPermintaanCuti(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });
    }
  });
};

export const normalizeLeaveStatusLabel = (status?: string) => {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'disetujui') {
    return { value: 'disetujui', label: 'Disetujui', badge: 'success' as const };
  }

  if (normalized === 'ditolak') {
    return { value: 'ditolak', label: 'Ditolak', badge: 'danger' as const };
  }

  return { value: 'menunggu', label: 'Menunggu', badge: 'warning' as const };
};

export const getApprovedLeaveCount = (leaveRequests: Cuti[]) =>
  leaveRequests.filter((request) => normalizeLeaveStatusLabel(request.status).value === 'disetujui').length;

export type { LeaveBalanceSummary };
