declare class CutiService {
    static getAllPermintaanCuti(query: any): Promise<any[]>;
    static getPermintaanCutiById(id: string): Promise<any>;
    static getPermintaanCutiByEmployeeId(employeeId: string): Promise<any[]>;
    static submitPermintaanCuti(requestData: any): Promise<any>;
    static updateStatusCuti(id: string, status: string, rejectionReason: string | null): Promise<{
        message: string;
    }>;
    static deletePermintaanCuti(id: string): Promise<{
        message: string;
    }>;
    static getSisaCuti(employeeId: string): Promise<{
        jatahCuti: number;
        cutiDiambil: number;
        cutiBersama: number;
        sisaCuti: number;
    }>;
}
export default CutiService;
//# sourceMappingURL=cuti.service.d.ts.map