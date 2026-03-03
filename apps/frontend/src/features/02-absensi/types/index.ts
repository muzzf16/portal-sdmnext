export interface Absensi {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: string;
  workDuration: string | null;
  notes?: string;
}
