declare class PermintaanPerubahanDataService {
    static getAllPermintaanPerubahanData(): Promise<any[]>;
    static getPermintaanPerubahanDataById(id: string): Promise<any>;
    static getPermintaanPerubahanDataByEmployeeId(employeeId: string): Promise<any[]>;
    static getPendingPermintaanPerubahanData(): Promise<any[]>;
    static createPermintaanPerubahanData(requestData: any): Promise<any>;
    static updatePermintaanPerubahanDataStatus(id: string, status: string): Promise<{
        message: string;
    }>;
    static deletePermintaanPerubahanData(id: string): Promise<{
        message: string;
    }>;
}
export default PermintaanPerubahanDataService;
//# sourceMappingURL=permintaanPerubahanData.service.d.ts.map