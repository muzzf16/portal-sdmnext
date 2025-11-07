export interface SalaryComponent {
    id: string;
    name: string;
    amount: number;
}
export interface Penggajian {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string;
    baseSalary: number;
    incomes: SalaryComponent[];
    deductions: SalaryComponent[];
    totalIncome: number;
    totalDeductions: number;
    netSalary: number;
}
//# sourceMappingURL=penggajian.model.d.ts.map