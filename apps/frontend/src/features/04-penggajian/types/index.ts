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
  status: 'Draft' | 'Final' | 'Paid';
  totalAttendance?: number;
  totalOvertime?: number;
  totalLateness?: number;
  tanggalPembayaran?: string;
}
// End of type definition
