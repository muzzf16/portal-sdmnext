export default class KpiService {
    static calculateScore(targetValue: number, actualValue: number, targetUnit: string): number;
    static getAll(filters?: {
        employeeId?: string;
        period?: string;
        status?: string;
    }): Promise<any[]>;
    static getByEmployeeId(employeeId: string): Promise<any[]>;
    static getByEmployeePeriod(employeeId: string, period: string): Promise<any[]>;
    static getById(id: string): Promise<any>;
    static create(data: any): Promise<any>;
    static update(id: string, data: any): Promise<any>;
    static updateActualValue(id: string, actualValue: number, evidenceUrl?: string): Promise<any>;
    static updateEvidence(id: string, evidenceUrl: string): Promise<any>;
    static delete(id: string): Promise<{
        message: string;
    }>;
    static generateFromAbk(employeeId: string, year: number, period: string): Promise<any[]>;
    static syncRealisasiFromWla(employeeId: string, period: string): Promise<{
        synced: number;
        skipped: number;
        period: string;
        startDate: string;
        endDate: string;
        details: any[];
    }>;
    private static parsePeriodToDateRange;
}
//# sourceMappingURL=kpi.service.d.ts.map