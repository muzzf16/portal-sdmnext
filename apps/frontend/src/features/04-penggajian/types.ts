
export interface Penggajian {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  incomes: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
  tanggalPembayaran: string;
}
