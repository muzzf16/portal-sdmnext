import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  clockIn,
  clockOut,
  createAbsensi,
  deleteAbsensi,
  getAbsensi,
  getAbsensiByEmployeeId,
  updateAbsensi,
  uploadLogMesin
} from '../api/absensiApi';
import type {
  Absensi,
  AbsensiCreatePayload,
  AbsensiFilters,
  AbsensiUpdatePayload,
  AttendanceClockInPayload
} from '../types';

export const ATTENDANCE_QUERY_KEYS = {
  all: ['attendance'] as const,
  list: (filters?: AbsensiFilters) => [...ATTENDANCE_QUERY_KEYS.all, 'list', filters ?? {}] as const,
  employee: (employeeId?: string, filters?: Omit<AbsensiFilters, 'employeeId'>) =>
    [...ATTENDANCE_QUERY_KEYS.all, 'employee', employeeId ?? 'anonymous', filters ?? {}] as const,
  mine: (employeeId?: string, filters?: Omit<AbsensiFilters, 'employeeId'>) =>
    [...ATTENDANCE_QUERY_KEYS.all, 'mine', employeeId ?? 'anonymous', filters ?? {}] as const
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const invalidateAttendanceQueries = (queryClient: ReturnType<typeof useQueryClient>, employeeId?: string) => {
  queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });

  if (employeeId) {
    queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.employee(employeeId)
    });
    queryClient.invalidateQueries({
      queryKey: ATTENDANCE_QUERY_KEYS.mine(employeeId)
    });
  }
};

export const useAttendanceRecords = (filters?: AbsensiFilters) =>
  useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await getAbsensi(filters);
      return response.data;
    },
    staleTime: 60 * 1000
  });

export const useAttendanceByEmployee = (
  employeeId?: string,
  filters?: Omit<AbsensiFilters, 'employeeId'>
) =>
  useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.employee(employeeId, filters),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getAbsensiByEmployeeId(employeeId, filters);
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 60 * 1000
  });

export const useMyAttendanceRecords = (filters?: Omit<AbsensiFilters, 'employeeId'>) => {
  const { user } = useAuth();
  const employeeId = user?.employeeId ? String(user.employeeId) : undefined;

  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.mine(employeeId, filters),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getAbsensiByEmployeeId(employeeId, filters);
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 60 * 1000
  });
};

export const useCreateAttendanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AbsensiCreatePayload) => {
      const response = await createAbsensi(payload);
      return response.data;
    },
    onSuccess: (record) => {
      invalidateAttendanceQueries(queryClient, record.employeeId);
    }
  });
};

export const useBulkCreateAttendanceRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AbsensiCreatePayload[]) => {
      const responses = await Promise.all(payload.map((record) => createAbsensi(record)));
      return responses.map((response) => response.data);
    },
    onSuccess: (records) => {
      const employeeIds = new Set(records.map((record) => record.employeeId));
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
      employeeIds.forEach((employeeId) => {
        invalidateAttendanceQueries(queryClient, employeeId);
      });
    }
  });
};

export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AbsensiUpdatePayload }) => {
      const response = await updateAbsensi(id, data);
      return response.data;
    },
    onSuccess: (record) => {
      invalidateAttendanceQueries(queryClient, record.employeeId);
    }
  });
};

export const useDeleteAttendanceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId?: string }) => {
      const response = await deleteAbsensi(id);
      return { ...response.data, employeeId };
    },
    onSuccess: ({ employeeId }) => {
      invalidateAttendanceQueries(queryClient, employeeId);
    }
  });
};

export const useClockInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AttendanceClockInPayload) => {
      const response = await clockIn(payload);
      return response.data;
    },
    onSuccess: (record) => {
      invalidateAttendanceQueries(queryClient, record.employeeId);
    }
  });
};

export const useClockOutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await clockOut(employeeId);
      return { ...response.data, employeeId };
    },
    onSuccess: ({ employeeId }) => {
      invalidateAttendanceQueries(queryClient, employeeId);
    }
  });
};

export const useUploadMachineLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadLogMesin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });
    }
  });
};

export const getTodayAttendanceRecord = (records: Absensi[], referenceDate = new Date()) => {
  const today = formatLocalDate(referenceDate);
  return records.find((record) => record.date === today) ?? null;
};
