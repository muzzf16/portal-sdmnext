// src/shared/services/pelatihanAPI.ts
import api from './api';
import { Pelatihan } from '../types/types';

export const getPelatihan = (employeeId: string) => api.get<Pelatihan[]>(`/pegawai/${employeeId}/pelatihan`);
export const addPelatihan = (employeeId: string, data: Omit<Pelatihan, 'id'>) => api.post<Pelatihan>(`/pegawai/${employeeId}/pelatihan`, data);
export const updatePelatihan = (id: number, data: Partial<Pelatihan>) => api.put<Pelatihan>(`/pelatihan/${id}`, data);
export const deletePelatihan = (id: number) => api.delete(`/pelatihan/${id}`);