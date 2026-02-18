export declare const PegawaiRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    findByNip(nip: string): Promise<any>;
    generateNip(): Promise<string>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    updatePayrollInfo(id: string, payrollInfo: any): Promise<{
        message: string;
    }>;
    getGenderDistribution(): Promise<{
        name: string;
        value: number;
    }[]>;
    getEducationDistribution(): Promise<{
        name: string;
        employees: number;
    }[]>;
    getDepartmentDistribution(): Promise<{
        name: any;
        value: any;
    }[]>;
    getEmployeeReportData(): Promise<any[]>;
    findByAtasanId(atasanId: string): Promise<any[]>;
    getSupervisorStats(atasanId: string): Promise<{
        totalTeam: any;
        presentToday: any;
        onLeaveToday: any;
        pendingLeaves: any;
    }>;
};
//# sourceMappingURL=pegawai.repository.d.ts.map