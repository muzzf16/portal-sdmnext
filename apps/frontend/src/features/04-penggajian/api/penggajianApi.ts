import api from '../../../shared/services/api';
import { Penggajian } from '../types';

export const getPenggajian = () => api.get<Penggajian[]>('/payrolls');
export const getPenggajianById = (id: string) => api.get<Penggajian>(`/payrolls/${id}`);
export const addSalaryComponent = (payrollId: string, component: { name: string; type: 'income' | 'deduction'; amount: number }) => api.post<Penggajian>(`/payrolls/${payrollId}/components`, component);
