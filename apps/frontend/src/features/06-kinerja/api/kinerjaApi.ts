import api from '../../../shared/services/api';
import { Kinerja } from '../types';

export const getPenilaianKinerja = () => api.get<{ success: boolean, data: Kinerja[] }>('/performance-reviews');
export const getPenilaianKinerjaById = (id: string) => api.get<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}`);
export const getPenilaianKinerjaByEmployeeId = (employeeId: string) => api.get<{ success: boolean, data: Kinerja[] }>(`/performance-reviews/employee/${employeeId}`);
export const buatPenilaianKinerja = (kinerjaData: Omit<Kinerja, 'id' | 'employeeName' | 'overallScore' | 'status' | 'createdAt'>) => api.post<{ success: boolean, data: Kinerja }>('/performance-reviews', kinerjaData);
export const updatePenilaianKinerja = (id: string, data: any) => api.put<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}`, data);
export const updateEmployeeFeedback = (id: string, employeeFeedback: string) => api.put(`/performance-reviews/${id}/feedback`, { employeeFeedback });

export const submitSelfAssessment = (id: string, data: {
    selfAssessmentKpis: any[];
    selfAssessmentStrengths: string;
    selfAssessmentAreas: string;
    selfAssessmentStatus: 'draft' | 'submitted';
}) => api.put(`/performance-reviews/${id}/self-assessment`, data);

// G1: Status lifecycle transition
export const transitionStatus = (id: string, targetStatus: string, selfAssessmentDeadline?: string) =>
    api.put(`/performance-reviews/${id}/transition`, { targetStatus, selfAssessmentDeadline });
