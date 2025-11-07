export declare const PermintaanCutiRepository: {
    findAll(query?: any): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    findApprovedByEmployeeId(employeeId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    updateStatus(id: string, status: string, rejectionReason?: string | null): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<boolean>;
    findRecentlyProcessed(): Promise<any[]>;
};
//# sourceMappingURL=permintaanCuti.repository.d.ts.map