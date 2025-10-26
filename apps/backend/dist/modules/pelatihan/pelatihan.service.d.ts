declare class PelatihanService {
    static getPelatihanByEmployeeId(employeeId: string): Promise<any[]>;
    static addPelatihan(employeeId: string, pelatihanData: any): Promise<{
        message: string;
    }>;
}
export default PelatihanService;
//# sourceMappingURL=pelatihan.service.d.ts.map