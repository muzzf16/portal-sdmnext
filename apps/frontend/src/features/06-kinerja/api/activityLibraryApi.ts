import api from '../../../shared/services/api';
import { ActivityLibraryItem } from '../types';

export const getActivityLibrary = (filters?: { position?: string; department?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (filters?.position) params.append('position', filters.position);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.category) params.append('category', filters.category);
    const qs = params.toString();
    return api.get(`/activity-library${qs ? `?${qs}` : ''}`);
};

export const getActivityByPosition = (position: string) =>
    api.get(`/activity-library/position/${encodeURIComponent(position)}`);

export const getActivityPositions = () =>
    api.get('/activity-library/positions');

export const getActivityById = (id: string) =>
    api.get(`/activity-library/${id}`);

export const createActivity = (data: Omit<ActivityLibraryItem, 'id' | 'created_at'>) =>
    api.post('/activity-library', data);

export const updateActivity = (id: string, data: Partial<ActivityLibraryItem>) =>
    api.put(`/activity-library/${id}`, data);

export const deleteActivity = (id: string) =>
    api.delete(`/activity-library/${id}`);
