
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
  // Pengaturan Cuti (UU 13/2003)
  annualLeaveQuota?: number;        // Jatah cuti tahunan (min. 12 hari)
  sickLeaveQuota?: number;          // Jatah cuti sakit
  maternityLeaveQuota?: number;     // Cuti melahirkan (default: 90 hari / 3 bulan)
  personalLeaveQuota?: number;      // Cuti pribadi (pernikahan, duka, dll)
  carryOverPolicy?: string;         // 'none' | 'full' | 'partial' — kebijakan carry-over saldo cuti
  probationMonths?: number;         // Masa percobaan sebelum berhak cuti (default: 12 bulan)
  // Informasi Pembayaran (PP 36/2021)
  bankName?: string;
  bankAccountNumber?: string;
  payrollDate?: number;
  overtimeMultiplier?: number;      // Pengali lembur jam pertama (default: 1.5)
  thrPolicy?: string;               // 'prorata' | 'full' — kebijakan THR
}
