import ApiService, { ApiResponse } from './apiService';
import { Notifikasi } from '../types/types';

// Create an instance of ApiService for notification operations
const notifikasiApi = new ApiService<Notifikasi>('/notifikasi');

// Export the standardized methods
export const getNotifikasiByEmployeeId = (employeeId: string) => notifikasiApi.list({ employeeId });
export const buatNotifikasi = (employeeId: string, message: string, type: string) => notifikasiApi.create({ employeeId, message, type });
export const tandaiNotifikasiSudahDibaca = (notificationId: string) => notifikasiApi.update(notificationId, { is_read: true });

export const getEmployeeRecentNotifications = async (employeeId: string, limit: number = 3) => {
  try {
    const response = await notifikasiApi.list({ employeeId });
    // Assuming notifications are returned in descending order of created_at or can be sorted
    return response.data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);
  } catch (error) {
    console.error('Error in getEmployeeRecentNotifications:', error);
    throw error;
  }
};

// Export the instance in case other methods are needed
export default notifikasiApi;