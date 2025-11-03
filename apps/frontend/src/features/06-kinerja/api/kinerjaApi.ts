import api from '../../../shared/services/api';
import { Kinerja } from '../types';

export const getPenilaianKinerja = () => api.get<Kinerja[]>('/performance-reviews');
export const getPenilaianKinerjaById = (id: string) => api.get<Kinerja>(`/performance-reviews/${id}`);
export const getPenilaianKinerjaByEmployeeId = (employeeId: string) => api.get<Kinerja[]>(`/performance-reviews?employeeId=${employeeId}`);
export const buatPenilaianKinerja = (kinerjaData: Omit<Kinerja, 'id' | 'employeeName' | 'overallScore' | 'status' | 'createdAt'>) => api.post<Kinerja>('/performance-reviews', kinerjaData);
