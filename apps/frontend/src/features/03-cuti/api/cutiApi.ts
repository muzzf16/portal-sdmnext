import api from '../../../shared/services/api';
import type { Cuti, CutiFilters, LeaveBalanceSummary, LeaveStatus } from '../types';

export const getPermintaanCuti = (filters?: CutiFilters) =>
  api.get<Cuti[]>('/leave-requests', {
    params: filters
  });

export const getPermintaanCutiSaya = (employeeId: string) =>
  api.get<Cuti[]>(`/leave-requests/employee/${employeeId}`);

export const getSisaCuti = (employeeId: string) =>
  api.get<LeaveBalanceSummary>(`/leave-requests/sisa-cuti/${employeeId}`);

export const ajukanPermintaanCuti = (cutiData: FormData) =>
  api.post<Cuti>('/leave-requests', cutiData);

export const perbaruiStatusPermintaanCuti = (id: string, status: LeaveStatus, rejectionReason?: string) =>
  api.put<Cuti>(`/leave-requests/${id}/status`, { status, rejectionReason });

export const hapusPermintaanCuti = (id: string) =>
  api.delete<{ message: string }>(`/leave-requests/${id}`);
