import api from '../../../shared/services/api';
import { Absensi } from '../types';

export const getAbsensi = () => api.get<Absensi[]>('/attendance');
export const getAbsensiByEmployeeId = (id: string) => api.get<Absensi[]>(`/attendance?employeeId=${id}`);
export const createAbsensi = (data: Omit<Absensi, 'id'>) => api.post<Absensi>('/attendance', data);
export const clockIn = (employeeId: string, employeeName: string) => api.post('/attendance/clock-in', { employeeId, employeeName });
export const clockOut = (employeeId: string) => api.post('/attendance/clock-out', { employeeId });

export const uploadLogMesin = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/attendance/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
