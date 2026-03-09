import { ReviewStatus } from './penilaianKinerja.model';
declare class KinerjaService {
    static getAllPenilaianKinerja(supervisorId?: string): Promise<any[]>;
    static getPenilaianKinerjaById(id: string): Promise<any>;
    static getPenilaianKinerjaByEmployeeId(employeeId: string): Promise<any[]>;
    static createPenilaianKinerja(reviewData: any): Promise<any>;
    static updatePenilaianKinerja(id: string, reviewData: any): Promise<any>;
    static addFeedbackKinerja(id: string, feedback: string): Promise<{
        message: string;
    }>;
    static deletePenilaianKinerja(id: string): Promise<{
        message: string;
    }>;
    static transitionStatus(id: string, targetStatus: ReviewStatus, userId?: string): Promise<any>;
    private static triggerNotification;
    static submitSelfAssessment(id: string, data: {
        selfAssessmentKpis: any[];
        selfAssessmentStrengths: string;
        selfAssessmentAreas: string;
        selfAssessmentStatus: 'draft' | 'submitted';
    }): Promise<any>;
}
export default KinerjaService;
//# sourceMappingURL=kinerja.service.d.ts.map