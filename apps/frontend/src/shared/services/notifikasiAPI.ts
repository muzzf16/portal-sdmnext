import api from './api';
import { Notifikasi } from '../types/types';

export const getNotifikasiByEmployeeId = (employeeId: string) => api.get<Notifikasi[]>(`/notifikasi/employee/${employeeId}`);

export const getEmployeeRecentNotifications = async (employeeId: string, limit: number = 3) => {
  try {
    const response = await getNotifikasiByEmployeeId(employeeId);
    // Assuming notifications are returned in descending order of created_at or can be sorted
    return response.data.data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);
  } catch (error) {
    console.error('Error in getEmployeeRecentNotifications:', error);
    throw error;
  }
};

export const buatNotifikasi = (employeeId: string, message: string, type: string) => api.post('/notifikasi/employee', { employeeId, message, type });
export const tandaiNotifikasiSudahDibaca = (notificationId: string) => api.put(`/notifikasi/${notificationId}/read`);