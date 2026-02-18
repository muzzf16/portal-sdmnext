export declare const WorkloadRepository: {
    findAnalysisByEmployeeYear(employeeId: string, year: number): Promise<any>;
    createAnalysis(data: any): Promise<any>;
    findAnalysisById(id: string): Promise<any>;
    updateAnalysisHeader(id: string, data: any): Promise<any>;
    clearItems(analysisId: string): Promise<void>;
    createItem(item: any): Promise<void>;
};
//# sourceMappingURL=workload.repository.d.ts.map