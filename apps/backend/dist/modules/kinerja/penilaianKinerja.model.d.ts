export interface Kpi {
    id: string;
    metric: string;
    target: string;
    result: string;
    weight: number;
    score: number;
    notes: string;
}
export interface SelfAssessmentKpi {
    kpiId: string;
    metric: string;
    selfScore: number;
    reason: string;
}
export type ReviewStatus = 'Draft' | 'Awaiting SA' | 'SA Submitted' | 'In Review' | 'Completed' | 'Finalized';
export declare const VALID_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]>;
export interface PenilaianKinerja {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string;
    reviewerName: string;
    reviewDate: string;
    overallScore: number;
    status: ReviewStatus;
    strengths: string;
    areasForImprovement: string;
    employeeFeedback: string;
    kpis: Kpi[];
    penilaiId: string | null;
    selfAssessmentScore: number | null;
    selfAssessmentKpis: SelfAssessmentKpi[] | null;
    selfAssessmentStrengths: string | null;
    selfAssessmentAreas: string | null;
    selfAssessmentDate: string | null;
    selfAssessmentStatus: 'belum_diisi' | 'draft' | 'submitted';
    selfAssessmentDeadline: string | null;
}
//# sourceMappingURL=penilaianKinerja.model.d.ts.map