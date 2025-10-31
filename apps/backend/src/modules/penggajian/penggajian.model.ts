
// src/modules/penggajian/penggajian.model.ts

export interface SalaryComponent {
  id: string;
  name: string;
  amount: number;
}

export interface Penggajian {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "Juni 2024"
  baseSalary: number;
  incomes: SalaryComponent[];
  deductions: SalaryComponent[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
}
