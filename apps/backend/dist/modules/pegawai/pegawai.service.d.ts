declare class PegawaiService {
    static getAllPegawai(): Promise<any[]>;
    static getPegawaiById(id: string): Promise<any>;
    private static validatePegawaiData;
    private static resolveJabatanFields;
    static createPegawai(name: string, email: string, pegawaiData: any): Promise<any>;
    static updatePegawai(id: string, name: string, email: string, pegawaiData: any): Promise<any>;
    static deletePegawai(id: string): Promise<{
        message: string;
    }>;
    static updatePegawaiPayrollInfo(id: string, payrollInfo: any): Promise<{
        message: string;
    }>;
    static getGenderDistribution(): Promise<{
        name: string;
        value: number;
    }[]>;
    static getEducationDistribution(): Promise<{
        name: string;
        employees: number;
    }[]>;
    static getDepartmentDistribution(): Promise<{
        name: any;
        value: any;
    }[]>;
}
export default PegawaiService;
//# sourceMappingURL=pegawai.service.d.ts.map