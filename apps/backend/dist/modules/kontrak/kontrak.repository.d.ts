export declare const KontrakRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmployeeId(employeeId: string): Promise<any[]>;
    create(contractData: any): Promise<any>;
    update(id: string, contractData: any): Promise<any>;
    delete(id: string): Promise<{
        id: string;
    }>;
};
//# sourceMappingURL=kontrak.repository.d.ts.map