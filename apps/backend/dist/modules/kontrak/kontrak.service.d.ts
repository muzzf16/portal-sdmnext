declare class KontrakService {
    static getAllContracts(): Promise<any[]>;
    static getContractById(id: string): Promise<any>;
    static getContractsByEmployeeId(employeeId: string): Promise<any[]>;
    static createContract(contractData: any): Promise<any>;
    static updateContract(id: string, contractData: any): Promise<any>;
    static deleteContract(id: string): Promise<{
        id: string;
    }>;
    static getExpiringContracts(days?: number): Promise<any[]>;
    static getRiwayatJabatan(employeeId: string): Promise<any[]>;
    static addRiwayatJabatan(employeeId: string, riwayatJabatanData: any): Promise<{
        message: string;
    }>;
}
export default KontrakService;
//# sourceMappingURL=kontrak.service.d.ts.map