declare class PegawaiService {
    static getAllPegawai(): Promise<any[]>;
    static getPegawaiById(id: string): Promise<any>;
    static createPegawai(name: string, email: string, pegawaiData: any): Promise<any>;
    static updatePegawai(id: string, name: string, email: string, pegawaiData: any): Promise<any>;
    static deletePegawai(id: string): Promise<{
        message: string;
    }>;
    static updatePegawaiPayrollInfo(id: string, payrollInfo: any): Promise<{
        message: string;
    }>;
}
export default PegawaiService;
//# sourceMappingURL=pegawai.service.d.ts.map