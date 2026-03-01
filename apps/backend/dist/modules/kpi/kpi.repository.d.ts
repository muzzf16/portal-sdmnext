export declare const KpiRepository: {
    findAll(filters?: {
        employeeId?: string;
        period?: string;
        status?: string;
    }): Promise<any[]>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    findByEmployeePeriod(employeeId: string, period: string): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    updateActualValue(id: string, actualValue: number, score: number, evidenceUrl?: string): Promise<any>;
    updateEvidence(id: string, evidenceUrl: string): Promise<any>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=kpi.repository.d.ts.map