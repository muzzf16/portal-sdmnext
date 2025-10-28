import api from '../../../shared/services/api';
import { Cuti } from '../types';

export const getPermintaanCuti = () => api.get<Cuti[]>('/leave-requests');
export const ajukanPermintaanCuti = (cutiData: Omit<Cuti, 'id' | 'employeeName' | 'status'>) => api.post<Cuti>('/leave-requests', cutiData);
export const perbaruiStatusPermintaanCuti = (id: string, status: string, rejectionReason?: string) => api.put(`/leave-requests/${id}/status`, { status, rejectionReason });
