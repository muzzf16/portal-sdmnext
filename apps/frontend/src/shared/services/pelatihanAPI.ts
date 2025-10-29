// src/shared/services/pelatihanAPI.ts
import api from './api';
import { Pelatihan } from '../types/types';

// Note: API endpoints use Indonesian field names, but this service maps to English field names for consistency

export const getPelatihan = (employeeId: string) => api.get<Pelatihan[]>(`/pelatihan/employee/${employeeId}`);
export const addPelatihan = (employeeId: string, data: Omit<Pelatihan, 'id'>) => api.post<Pelatihan>(`/pelatihan/employee/${employeeId}`, data);
export const updatePelatihan = (id: number, data: Partial<Pelatihan>) => api.put<Pelatihan>(`/pelatihan/${id}`, data);
export const deletePelatihan = (id: number) => api.delete(`/pelatihan/${id}`);