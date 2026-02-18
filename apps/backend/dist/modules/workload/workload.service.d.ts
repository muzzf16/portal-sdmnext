export default class WorkloadService {
    static calculateFTE(totalYearlyMinutes: number): {
        ftePercentage: number;
        fteStatus: 'Overload' | 'Normal' | 'Underload';
        hoursPerDay: number;
    };
    static calculateTotalMinutes(item: any): number;
    static getAnalysis(employeeId: string, year: number): Promise<any>;
    static getAnalysisById(id: string): Promise<any>;
    static saveAnalysis(data: any): Promise<any>;
}
//# sourceMappingURL=workload.service.d.ts.map