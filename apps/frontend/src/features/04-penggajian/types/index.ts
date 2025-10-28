export interface Penggajian {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  incomes: any[];
  deductions: any[];
  totalIncome: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
}
