export interface Kpi {
    id: string;
    metric: string;
    target: string;
    result: string;
    weight: number;
    score: number;
    notes: string;
}
export interface PenilaianKinerja {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string;
    reviewerName: string;
    reviewDate: string;
    overallScore: number;
    status: string;
    strengths: string;
    areasForImprovement: string;
    employeeFeedback: string;
    kpis: Kpi[];
}
//# sourceMappingURL=penilaianKinerja.model.d.ts.map