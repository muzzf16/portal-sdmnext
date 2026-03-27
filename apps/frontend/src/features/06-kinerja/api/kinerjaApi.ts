import api from '../../../shared/services/api';
import { Kinerja, PerformanceReviewKpi, ReviewStatus, SelfAssessmentKpi } from '../types';

export interface CreateKinerjaPayload {
    employeeId: string;
    employeeName?: string;
    period: string;
    reviewerName: string;
    reviewDate: string;
    strengths?: string;
    areasForImprovement?: string;
    employeeFeedback?: string;
    kpis: PerformanceReviewKpi[];
    penilaiId?: string;
    status?: ReviewStatus;
    selfAssessmentDeadline?: string;
}

export interface UpdateKinerjaPayload extends Partial<CreateKinerjaPayload> {}

export const getPenilaianKinerja = () => api.get<{ success: boolean, data: Kinerja[] }>('/performance-reviews');
export const getPenilaianKinerjaById = (id: string) => api.get<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}`);
export const getPenilaianKinerjaByEmployeeId = (employeeId: string) => api.get<{ success: boolean, data: Kinerja[] }>(`/performance-reviews/employee/${employeeId}`);
export const buatPenilaianKinerja = (kinerjaData: CreateKinerjaPayload) => api.post<{ success: boolean, data: Kinerja }>('/performance-reviews', kinerjaData);
export const updatePenilaianKinerja = (id: string, data: UpdateKinerjaPayload) => api.put<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}`, data);
export const updateEmployeeFeedback = (id: string, employeeFeedback: string) => api.put<{ success: boolean, data: Kinerja }>(`/performance-reviews/${id}/feedback`, { employeeFeedback });

export const submitSelfAssessment = (id: string, data: {
    selfAssessmentKpis: SelfAssessmentKpi[];
    selfAssessmentStrengths: string;
    selfAssessmentAreas: string;
    selfAssessmentStatus: 'draft' | 'submitted';
}) => api.put<{ success: boolean; data: Kinerja }>(`/performance-reviews/${id}/self-assessment`, data);

export const transitionStatus = (id: string, targetStatus: ReviewStatus, selfAssessmentDeadline?: string) =>
    api.put<{ success: boolean; data: Kinerja }>(`/performance-reviews/${id}/transition`, { targetStatus, selfAssessmentDeadline });
