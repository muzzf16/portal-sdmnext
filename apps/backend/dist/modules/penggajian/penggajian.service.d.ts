declare class PenggajianService {
    static getAllPenggajian(): Promise<any[]>;
    static getPenggajianById(id: string): Promise<any>;
    static getPenggajianByEmployeeId(employeeId: string): Promise<any[]>;
    static createPenggajian(payrollData: any): Promise<any>;
    static updatePenggajian(id: string, payrollData: any): Promise<any>;
    static deletePenggajian(id: string): Promise<{
        message: string;
    }>;
    static addSalaryComponent(id: string, component: {
        name: string;
        type: 'income' | 'deduction';
        amount: number;
    }): Promise<any>;
}
export default PenggajianService;
//# sourceMappingURL=penggajian.service.d.ts.map