import api from '../../../shared/services/api';
import type {
  Absensi,
  AbsensiCreatePayload,
  AbsensiFilters,
  AbsensiUpdatePayload,
  AttendanceClockInPayload,
  AttendanceUploadResult
} from '../types';

export const getAbsensi = (filters?: AbsensiFilters) =>
  api.get<Absensi[]>('/attendance', { params: filters });

export const getAbsensiByEmployeeId = (
  id: string,
  filters?: Omit<AbsensiFilters, 'employeeId'>
) => api.get<Absensi[]>(`/attendance/employee/${id}`, { params: filters });

export const createAbsensi = (data: AbsensiCreatePayload) => api.post<Absensi>('/attendance', data);
export const updateAbsensi = (id: string, data: AbsensiUpdatePayload) => api.put<Absensi>(`/attendance/${id}`, data);
export const deleteAbsensi = (id: string) => api.delete<{ message: string }>(`/attendance/${id}`);
export const clockIn = (payload: AttendanceClockInPayload) => api.post<Absensi>('/attendance/clock-in', payload);
export const clockOut = (employeeId: string) => api.post<{ message: string }>('/attendance/clock-out', { employeeId });

export const uploadLogMesin = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<AttendanceUploadResult>('/attendance/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
