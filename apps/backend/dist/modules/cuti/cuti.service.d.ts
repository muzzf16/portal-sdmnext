declare class CutiService {
    static getAllPermintaanCuti(): Promise<any[]>;
    static getPermintaanCutiById(id: string): Promise<any>;
    static submitPermintaanCuti(requestData: any): Promise<any>;
    static updateStatusCuti(id: string, status: string, rejectionReason: string | null): Promise<{
        message: string;
    }>;
    static deletePermintaanCuti(id: string): Promise<{
        message: string;
    }>;
}
export default CutiService;
//# sourceMappingURL=cuti.service.d.ts.map