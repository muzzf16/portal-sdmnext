import api from '../../../shared/services/api';
import { Cuti } from '../types';

export const getPermintaanCuti = () => api.get<Cuti[]>('/leave-requests');
export const getPermintaanCutiSaya = (employeeId: string) => api.get<Cuti[]>(`/leave-requests/employee/${employeeId}`);
export const ajukanPermintaanCuti = (cutiData: Omit<Cuti, 'id' | 'employeeName' | 'status'> & { employeeId: string, employeeName: string }) => api.post<Cuti>('/leave-requests', cutiData);
export const perbaruiStatusPermintaanCuti = (id: string, status: string, rejectionReason?: string) => api.put(`/leave-requests/${id}/status`, { status, rejectionReason });
