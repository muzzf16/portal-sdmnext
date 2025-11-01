import api from '../../../shared/services/api';
import { Absensi } from '../types';

export const getAbsensi = () => api.get<Absensi[]>('/attendance');
export const getAbsensiByEmployeeId = (id: string) => api.get<Absensi[]>(`/attendance?employeeId=${id}`);
export const clockIn = () => api.post('/attendance/clock-in');
export const clockOut = () => api.post('/attendance/clock-out');
