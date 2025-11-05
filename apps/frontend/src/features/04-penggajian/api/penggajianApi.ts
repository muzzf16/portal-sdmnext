import api from '../../../shared/services/api';
import { Penggajian } from '../types';

export const downloadPayslip = (payrollId: string) => 
  api.get(`/payrolls/${payrollId}/download`, { responseType: 'blob' });

export const getPenggajian = (params: { search?: string; period?: string }) => api.get<Penggajian[]>('/payrolls', { params });
export const getPenggajianById = (id: string) => api.get<Penggajian>(`/payrolls/${id}`);
export const addSalaryComponent = (payrollId: string, component: { name: string; type: 'income' | 'deduction'; amount: number }) => api.post<Penggajian>(`/payrolls/${payrollId}/components`, component);
export const updatePenggajian = (id: string, data: Partial<Penggajian>) => api.put<Penggajian>(`/payrolls/${id}`, data);
export const runPayroll = (period: string) => api.post('/payrolls/run', { period });
