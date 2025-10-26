
// src/modules/absensi/absensi.model.ts

export interface Absensi {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm:ss
  clockOut: string | null; // HH:mm:ss
  status: string;
  workDuration: string | null; // e.g., "8j 15m"
  notes?: string;
}
