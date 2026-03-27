
import api from '../../../shared/services/api';
import { WorkLoadAnalysis } from '../types';

export const getWorkloadAnalysis = (employeeId: string, year: number) =>
    api.get<{ success: boolean; data: WorkLoadAnalysis | null }>(`/workload/${employeeId}?year=${year}`);

export const saveWorkloadAnalysis = (data: WorkLoadAnalysis) =>
    api.post<{ success: boolean; data: WorkLoadAnalysis }>('/workload', data);

export const submitWorkloadAnalysis = (id: string) =>
    api.put<{ success: boolean; data: WorkLoadAnalysis }>(`/workload/${id}/submit`);

export const approveWorkloadAnalysis = (id: string) =>
    api.put<{ success: boolean; data: WorkLoadAnalysis }>(`/workload/${id}/approve`);
