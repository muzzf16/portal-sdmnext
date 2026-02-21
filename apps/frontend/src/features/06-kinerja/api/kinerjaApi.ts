import api from '../../../shared/services/api';
import { Kinerja } from '../types';

export const getPenilaianKinerja = () => api.get<{ success: boolean, data: Kinerja[] }>('/performance-reviews');
export const getPenilaianKinerjaById = (id: string) => api.get<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}`);
export const getPenilaianKinerjaByEmployeeId = (employeeId: string) => api.get<{ success: boolean, data: Kinerja[] }>(`/performance-reviews/employee/${employeeId}`);
export const buatPenilaianKinerja = (kinerjaData: Omit<Kinerja, 'id' | 'employeeName' | 'overallScore' | 'status' | 'createdAt'>) => api.post<{ success: boolean, data: Kinerja }>('/performance-reviews', kinerjaData);
