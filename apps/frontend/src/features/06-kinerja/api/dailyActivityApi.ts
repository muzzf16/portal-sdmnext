import api from '../../../shared/services/api';
import { DailyActivity } from '../types';

export const getDailyActivities = (params?: any) =>
    api.get<DailyActivity[]>('/daily-activities', { params });

export const getDailyActivitiesByEmployeeId = (employeeId: number | string, params?: any) =>
    api.get<DailyActivity[]>(`/daily-activities/employee/${employeeId}`, { params });

export const getDailyActivityById = (id: number | string) =>
    api.get<DailyActivity>(`/daily-activities/${id}`);

export const createDailyActivity = (data: Partial<DailyActivity>) =>
    api.post<DailyActivity>('/daily-activities', data);

export const updateDailyActivity = (id: number | string, data: Partial<DailyActivity>) =>
    api.put<DailyActivity>(`/daily-activities/${id}`, data);

export const deleteDailyActivity = (id: number | string) =>
    api.delete(`/daily-activities/${id}`);

export const approveRejectActivity = (id: number | string, status: 'approved' | 'rejected') =>
    api.put<DailyActivity>(`/daily-activities/${id}/status`, { status });
