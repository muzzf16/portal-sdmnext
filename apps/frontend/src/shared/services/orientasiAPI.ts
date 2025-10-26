import api from './api';
import { TugasOrientasi } from '../types/types';

export const getTugasOrientasi = (employeeId: string) => api.get<TugasOrientasi[]>(`/orientasi/${employeeId}/tasks`);
export const buatTugasOrientasi = (employeeId: string, data: Omit<TugasOrientasi, 'id'>) => api.post<TugasOrientasi>(`/orientasi/${employeeId}/tasks`, data);
export const perbaruiTugasOrientasi = (taskId: number, data: Partial<TugasOrientasi>) => api.put<TugasOrientasi>(`/orientasi/tasks/${taskId}`, data);
export const hapusTugasOrientasi = (taskId: number) => api.delete(`/orientasi/tasks/${taskId}`);