
export interface CompanySettings {
  id: number;
  companyName: string;
  npwp: string;
  address: string;
  logo: string;
  // Pengaturan Jam Kerja
  workStartTime?: string;
  workEndTime?: string;
  lateToleranceMinutes?: number;
  // Pengaturan Cuti
  annualLeaveQuota?: number;
  sickLeaveQuota?: number;
  // Informasi Pembayaran
  bankName?: string;
  bankAccountNumber?: string;
  payrollDate?: number;
}
