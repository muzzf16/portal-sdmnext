
// src/modules/penggajian/penggajian.model.ts

export interface Penggajian {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "Juni 2024"
  baseSalary: number;
  incomes: any[];
  deductions: any[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
}
