import { ReviewStatus, SelfAssessmentKpi } from './penilaianKinerja.model';

export interface PerformanceReviewKpiSnapshot {
  id?: string;
  kpiId?: string;
  name: string;
  score: number;
  weight: number;
  targetValue?: number;
  actualValue?: number;
  targetUnit?: string;
  notes?: string;
}

export interface CreatePerformanceReviewPayload {
  id?: string;
  employeeId: string;
  employeeName?: string;
  period: string;
  reviewerName: string;
  reviewDate: string;
  status?: ReviewStatus;
  strengths?: string;
  areasForImprovement?: string;
  employeeFeedback?: string;
  kpis?: PerformanceReviewKpiSnapshot[];
  penilaiId?: string | null;
  selfAssessmentDeadline?: string | null;
}

export interface UpdatePerformanceReviewPayload {
  employeeName?: string;
  period?: string;
  reviewerName?: string;
  reviewDate?: string;
  status?: ReviewStatus;
  strengths?: string;
  areasForImprovement?: string;
  employeeFeedback?: string;
  kpis?: PerformanceReviewKpiSnapshot[];
  penilaiId?: string | null;
  selfAssessmentDeadline?: string | null;
}

export interface SubmitSelfAssessmentPayload {
  selfAssessmentKpis: SelfAssessmentKpi[];
  selfAssessmentStrengths: string;
  selfAssessmentAreas: string;
  selfAssessmentStatus: 'draft' | 'submitted';
}

export interface TransitionPerformanceReviewPayload {
  targetStatus: ReviewStatus;
  selfAssessmentDeadline?: string | null;
}
