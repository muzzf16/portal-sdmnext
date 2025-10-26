import api from '../../../shared/services/api';
import { Notifikasi } from '../types';

export const getNotifikasi = () => api.get<Notifikasi[]>('/notifications');
export const getNotifikasiByEmployeeId = (employeeId: string) => api.get<Notifikasi[]>(`/notifikasi/employee/${employeeId}`);
export const tandaiNotifikasiSudahDibaca = (notificationId: string) => api.put(`/notifications/${notificationId}/read`);
