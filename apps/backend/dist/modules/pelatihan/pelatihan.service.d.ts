declare class PelatihanService {
    static getAllPelatihan(): Promise<{
        id: any;
        employeeId: any;
        trainingName: any;
        organizer: any;
        startDate: any;
        endDate: any;
        certificate: any;
    }[]>;
    static getPelatihanByEmployeeId(employeeId: string): Promise<{
        id: any;
        employeeId: any;
        trainingName: any;
        organizer: any;
        startDate: any;
        endDate: any;
        certificate: any;
    }[]>;
    static addPelatihan(employeeId: string, pelatihanData: any): Promise<{
        message: string;
    }>;
}
export default PelatihanService;
//# sourceMappingURL=pelatihan.service.d.ts.map