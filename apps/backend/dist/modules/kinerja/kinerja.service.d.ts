declare class KinerjaService {
    static getAllPenilaianKinerja(): Promise<any[]>;
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
}
export default KinerjaService;
//# sourceMappingURL=kinerja.service.d.ts.map