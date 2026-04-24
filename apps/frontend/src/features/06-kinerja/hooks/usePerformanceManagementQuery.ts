import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getJabatanList, getSubordinates } from '../../01-pegawai/api/jabatanApi';
import {
  createActivity,
  deleteActivity,
  getActivityLibrary,
  getActivityPositions,
  updateActivity
} from '../api/activityLibraryApi';
import {
  getAdminDetailLogsWla,
  getAdminLogAktivitasSummaryWla,
  getMyLogAktivitasWla,
  updateLogAktivitasStatusWla,
  createBulkLogAktivitasWla
} from '../api/logAktivitasHarianApi';
import {
  applyKpiTemplates,
  createKpiTarget,
  deleteKpiTarget,
  generateKpiFromAbk,
  getKpiSummary,
  getKpiTargets,
  getKpiTemplates,
  rebalanceKpiWeights,
  syncKpiFromWla,
  updateActualValue,
  updateKpiTarget
} from '../api/kpiApi';
import {
  getPenilaianKinerja,
  getPenilaianKinerjaByEmployeeId,
  getPenilaianKinerjaById,
  submitSelfAssessment,
  transitionStatus
} from '../api/kinerjaApi';
import {
  createPerformanceCycleReviews,
  finalizePerformanceCycle,
  openPerformancePeriod,
  syncPerformanceCycleKpi
} from '../api/performanceCycleApi';
import { createTask, deleteTask, getTasksByEmployee, getTasksBySupervisor, updateTaskStatus } from '../api/taskApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { getWorkloadAnalysis } from '../api/workloadApi';
import type {
  ActivityLibraryItem,
  AdminWlaSummary,
  Kinerja,
  PerformanceCycleBatchPayload,
  KpiSummaryRow,
  KpiTarget,
  LogAktivitasHarian,
  ReviewStatus,
  SelfAssessmentKpi
} from '../types';
import type { AssignedTask } from '../../../shared/types/types';
import type { Pegawai } from '../../01-pegawai/types';

type ActivityFilters = { position?: string; department?: string; category?: string };

export const PERFORMANCE_QUERY_KEYS = {
  activityLibrary: {
    all: ['performance', 'activity-library'] as const,
    list: (filters?: ActivityFilters) => [...PERFORMANCE_QUERY_KEYS.activityLibrary.all, 'list', filters ?? {}] as const,
    positions: () => [...PERFORMANCE_QUERY_KEYS.activityLibrary.all, 'positions'] as const
  },
  employee: {
    all: ['performance', 'employee'] as const,
    selectable: (role?: string, employeeId?: string) => [...PERFORMANCE_QUERY_KEYS.employee.all, 'selectable', role ?? 'guest', employeeId ?? 'anonymous'] as const
  },
  task: {
    all: ['performance', 'task'] as const,
    supervisor: (supervisorId?: string) => [...PERFORMANCE_QUERY_KEYS.task.all, 'supervisor', supervisorId ?? 'anonymous'] as const,
    employee: (employeeId?: string, status?: AssignedTask['status']) =>
      [...PERFORMANCE_QUERY_KEYS.task.all, 'employee', employeeId ?? 'anonymous', status ?? 'all'] as const,
    subordinates: (supervisorId?: string) => [...PERFORMANCE_QUERY_KEYS.task.all, 'subordinates', supervisorId ?? 'anonymous'] as const
  },
  wla: {
    all: ['performance', 'wla'] as const,
    myLogs: (employeeId?: string, tanggal?: string) => [...PERFORMANCE_QUERY_KEYS.wla.all, 'my-logs', employeeId ?? 'anonymous', tanggal ?? 'today'] as const,
    adminSummary: (startDate?: string, endDate?: string) =>
      [...PERFORMANCE_QUERY_KEYS.wla.all, 'admin-summary', startDate ?? 'start', endDate ?? 'end'] as const,
    adminDetail: (employeeId?: string, startDate?: string, endDate?: string) =>
      [...PERFORMANCE_QUERY_KEYS.wla.all, 'admin-detail', employeeId ?? 'anonymous', startDate ?? 'start', endDate ?? 'end'] as const
  },
  workload: {
    all: ['performance', 'workload'] as const,
    analysis: (employeeId?: string, year?: number) => [...PERFORMANCE_QUERY_KEYS.workload.all, 'analysis', employeeId ?? 'anonymous', year ?? 'unknown'] as const
  },
  kpi: {
    all: ['performance', 'kpi'] as const,
    list: (filters?: { employeeId?: string; period?: string; role?: string }) =>
      [...PERFORMANCE_QUERY_KEYS.kpi.all, 'list', filters ?? {}] as const,
    summary: (startDate?: string, endDate?: string) =>
      [...PERFORMANCE_QUERY_KEYS.kpi.all, 'summary', startDate ?? 'start', endDate ?? 'end'] as const,
    templates: () => [...PERFORMANCE_QUERY_KEYS.kpi.all, 'templates'] as const
  },
  performanceReview: {
    all: ['performance', 'review'] as const,
    list: () => [...PERFORMANCE_QUERY_KEYS.performanceReview.all, 'list'] as const,
    detail: (id?: string) => [...PERFORMANCE_QUERY_KEYS.performanceReview.all, 'detail', id ?? 'unknown'] as const,
    employee: (employeeId?: string) => [...PERFORMANCE_QUERY_KEYS.performanceReview.all, 'employee', employeeId ?? 'anonymous'] as const
  },
  performanceCycle: {
    all: ['performance', 'cycle'] as const
  }
};

const invalidatePerformanceReviewQueries = (queryClient: ReturnType<typeof useQueryClient>, employeeId?: string, reviewId?: string) => {
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.all });

  if (employeeId) {
    queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.employee(employeeId) });
  }

  if (reviewId) {
    queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.detail(reviewId) });
  }
};

export const useActivityLibraryList = (filters?: ActivityFilters) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.activityLibrary.list(filters),
    queryFn: async () => {
      const response = await getActivityLibrary(filters);
      return (response.data?.data || []) as ActivityLibraryItem[];
    },
    staleTime: 60 * 1000
  });

export const useActivityPositions = () =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.activityLibrary.positions(),
    queryFn: async () => {
      const response = await getActivityPositions();
      return (response.data?.data || []) as string[];
    },
    staleTime: 5 * 60 * 1000
  });

export const useJabatanListQuery = () =>
  useQuery({
    queryKey: ['jabatan', 'list'],
    queryFn: getJabatanList,
    staleTime: 5 * 60 * 1000
  });

export const useDirectorNames = () =>
  useQuery({
    queryKey: ['employees', 'directors'],
    queryFn: async () => {
      const { getPegawai } = await import('../../01-pegawai/api/employeeApi');
      const response = await getPegawai();
      const allEmps = response.data || [];
      const dirU = allEmps.find((e: any) => e.position?.toUpperCase() === 'DIREKTUR UTAMA' || e.jabatan?.toUpperCase() === 'DIREKTUR UTAMA');
      const dirY = allEmps.find((e: any) => e.position?.toUpperCase() === 'DIREKTUR YMFK' || e.jabatan?.toUpperCase() === 'DIREKTUR YMFK');
      return {
        utama: dirU?.name || '..............................',
        ymfk: dirY?.name || '..............................'
      };
    },
    staleTime: 5 * 60 * 1000
  });

export const useSelectablePerformanceEmployees = (role?: string, employeeId?: string, employeeName?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.employee.selectable(role, employeeId),
    queryFn: async () => {
      if (role === 'employee' && employeeId) {
        return [{ id: employeeId, name: employeeName || employeeId, nip: employeeId }] as Array<Partial<Pegawai>>;
      }

      if (role === 'supervisor' && employeeId) {
        return getSubordinates(String(employeeId), true);
      }

      const response = await getPegawai();
      return response.data || [];
    },
    staleTime: 60 * 1000
  });

export const useCreateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.activityLibrary.all });
    }
  });
};

export const useUpdateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActivityLibraryItem> }) => updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.activityLibrary.all });
    }
  });
};

export const useDeleteActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.activityLibrary.all });
    }
  });
};

export const useSupervisorTasks = (supervisorId?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.task.supervisor(supervisorId),
    queryFn: async () => {
      if (!supervisorId) {
        return [];
      }

      const response = await getTasksBySupervisor(supervisorId);
      return response.data?.data || [];
    },
    enabled: !!supervisorId,
    staleTime: 30 * 1000
  });

export const useEmployeeTasks = (employeeId?: string, status?: AssignedTask['status']) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.task.employee(employeeId, status),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getTasksByEmployee(employeeId, status);
      return response.data?.data || [];
    },
    enabled: !!employeeId,
    staleTime: 30 * 1000
  });

export const useSubordinates = (supervisorId?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.task.subordinates(supervisorId),
    queryFn: async () => {
      if (!supervisorId) {
        return [];
      }

      return getSubordinates(supervisorId, true);
    },
    enabled: !!supervisorId,
    staleTime: 60 * 1000
  });

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.all });
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.supervisor(variables.supervisor_id) });
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.employee(variables.employee_id) });
    }
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignedTask['status'] }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.all });
    }
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.all });
    }
  });
};

export const useMyWlaLogs = (tanggal: string, employeeId?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.wla.myLogs(employeeId, tanggal),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getMyLogAktivitasWla(tanggal, Number(employeeId));
      return response.data?.data || [];
    },
    enabled: !!employeeId && !!tanggal,
    staleTime: 15 * 1000
  });

export const useAdminWlaSummary = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.wla.adminSummary(startDate, endDate),
    queryFn: async () => {
      const response = await getAdminLogAktivitasSummaryWla(undefined, startDate, endDate);
      return (response.data?.data || []) as AdminWlaSummary[];
    },
    enabled: !!startDate && !!endDate,
    staleTime: 15 * 1000
  });

export const useWorkloadAnalysis = (employeeId?: string, year?: number) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.workload.analysis(employeeId, year),
    queryFn: async () => {
      if (!employeeId || !year) {
        return null;
      }

      const response = await getWorkloadAnalysis(employeeId, year);
      return response.data?.data || null;
    },
    enabled: !!employeeId && !!year,
    staleTime: 30 * 1000
  });

export const useKpiTargetList = (filters: { employeeId?: string; period?: string; role?: string }, enabled = true) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.kpi.list(filters),
    queryFn: async () => {
      const response = await getKpiTargets({
        employeeId: filters.employeeId,
        period: filters.period
      });
      return (response.data?.data || []) as KpiTarget[];
    },
    enabled,
    staleTime: 15 * 1000
  });

export const useKpiSummary = (startDate: string, endDate: string, enabled = true) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.kpi.summary(startDate, endDate),
    queryFn: async () => {
      const response = await getKpiSummary({ startDate, endDate });
      return (response.data?.data || []) as KpiSummaryRow[];
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 15 * 1000
  });

export const useKpiMonitoringSummary = (startDate: string, endDate: string, enabled = true) =>
  useQuery({
    queryKey: ['kpi', 'monitoring-summary', startDate, endDate],
    queryFn: async () => {
      const { getMonitoringSummary } = await import('../api/kpiApi');
      const response = await getMonitoringSummary({ startDate, endDate });
      return response.data?.data || [];
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 15 * 1000
  });

export const useKpiTemplates = (enabled = true) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.kpi.templates(),
    queryFn: async () => {
      const response = await getKpiTemplates();
      return {
        templates: response.data?.data || [],
        departments: response.data?.departments || []
      };
    },
    enabled,
    staleTime: 60 * 1000
  });

const invalidateKpiQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.kpi.all });
};

export const useCreateKpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKpiTarget,
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useUpdateKpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KpiTarget> }) => updateKpiTarget(id, data),
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useDeleteKpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKpiTarget,
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useUpdateKpiActualMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actualValue, evidenceFile }: { id: string; actualValue: number; evidenceFile?: File }) =>
      updateActualValue(id, actualValue, evidenceFile),
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useGenerateKpiFromAbkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, year, period }: { employeeId: string; year: number; period: string }) =>
      generateKpiFromAbk(employeeId, year, period),
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useSyncKpiFromWlaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, period }: { employeeId: string; period: string }) =>
      syncKpiFromWla(employeeId, period),
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useRebalanceKpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, period }: { employeeId: string; period: string }) =>
      rebalanceKpiWeights(employeeId, period),
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};

export const useApplyKpiTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyKpiTemplates,
    onSuccess: () => {
      invalidateKpiQueries(queryClient);
    }
  });
};
export const fetchAdminWlaDetailLogs = async (employeeId: string, startDate: string, endDate: string) => {
  const response = await getAdminDetailLogsWla(employeeId, undefined, startDate, endDate);
  return (response.data?.data || []) as LogAktivitasHarian[];
};

export const useAdminWlaDetailLogs = (employeeId?: string, startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.wla.adminDetail(employeeId, startDate, endDate),
    queryFn: async () => {
      if (!employeeId || !startDate || !endDate) return [];
      const response = await getAdminDetailLogsWla(employeeId, undefined, startDate, endDate);
      return (response.data?.data || []) as LogAktivitasHarian[];
    },
    enabled: !!employeeId && !!startDate && !!endDate,
    staleTime: 15 * 1000
  });

export const useCreateBulkWlaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBulkLogAktivitasWla,
    onSuccess: (_, variables) => {
      const employeeId = variables.id_pegawai ? String(variables.id_pegawai) : undefined;
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.wla.all });
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.all });

      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.wla.myLogs(employeeId, variables.tanggal) });
        queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.task.employee(employeeId) });
      }
    }
  });
};

export const useUpdateWlaStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: 'approved' | 'rejected' }) => updateLogAktivitasStatusWla(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.wla.all });
    }
  });
};

export const usePerformanceReviewList = () =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.list(),
    queryFn: async () => {
      const response = await getPenilaianKinerja();
      return response.data?.data || [];
    },
    staleTime: 30 * 1000
  });

export const usePerformanceReview = (id?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.detail(id),
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const response = await getPenilaianKinerjaById(id);
      return response.data?.data || null;
    },
    enabled: !!id,
    staleTime: 30 * 1000
  });

export const useEmployeePerformanceReviews = (employeeId?: string) =>
  useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.employee(employeeId),
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const response = await getPenilaianKinerjaByEmployeeId(employeeId);
      return response.data?.data || [];
    },
    enabled: !!employeeId,
    staleTime: 30 * 1000
  });

export const useTransitionPerformanceReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetStatus, selfAssessmentDeadline }: { id: string; targetStatus: ReviewStatus; selfAssessmentDeadline?: string }) =>
      transitionStatus(id, targetStatus, selfAssessmentDeadline),
    onSuccess: (response: any, variables) => {
      const review = response?.data?.data as Kinerja | undefined;
      invalidatePerformanceReviewQueries(queryClient, review?.employeeId, variables.id);
    }
  });
};

export const useSubmitSelfAssessmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { selfAssessmentKpis: SelfAssessmentKpi[]; selfAssessmentStrengths: string; selfAssessmentAreas: string; selfAssessmentStatus: 'draft' | 'submitted' } }) =>
      submitSelfAssessment(id, data),
    onSuccess: (response: any, variables) => {
      const review = response?.data?.data as Kinerja | undefined;
      invalidatePerformanceReviewQueries(queryClient, review?.employeeId, variables.id);
    }
  });
};

const invalidatePerformanceCycleQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.kpi.all });
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.wla.all });
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.workload.all });
  queryClient.invalidateQueries({ queryKey: PERFORMANCE_QUERY_KEYS.performanceReview.all });
};

export const useOpenPerformancePeriodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PerformanceCycleBatchPayload) => openPerformancePeriod(payload),
    onSuccess: () => {
      invalidatePerformanceCycleQueries(queryClient);
    }
  });
};

export const useSyncPerformanceCycleKpiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PerformanceCycleBatchPayload) => syncPerformanceCycleKpi(payload),
    onSuccess: () => {
      invalidatePerformanceCycleQueries(queryClient);
    }
  });
};

export const useCreatePerformanceCycleReviewsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PerformanceCycleBatchPayload) => createPerformanceCycleReviews(payload),
    onSuccess: () => {
      invalidatePerformanceCycleQueries(queryClient);
    }
  });
};

export const useFinalizePerformanceCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PerformanceCycleBatchPayload) => finalizePerformanceCycle(payload),
    onSuccess: () => {
      invalidatePerformanceCycleQueries(queryClient);
    }
  });
};
