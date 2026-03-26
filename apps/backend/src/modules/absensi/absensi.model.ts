
export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'cuti' | 'alpha';

export interface Absensi {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  workDuration: string | null;
  notes?: string | null;
}

export interface AbsensiFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AbsensiCreatePayload {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  status?: string;
  workDuration?: string | null;
  notes?: string | null;
}

export interface AbsensiUpdatePayload {
  employeeName?: string;
  date?: string;
  clockIn?: string | null;
  clockOut?: string | null;
  status?: string;
  workDuration?: string | null;
  notes?: string | null;
}

export interface AttendanceClockPayload {
  employeeId: string;
  employeeName?: string;
}

export interface ParsedMachineAttendanceLog {
  machineEmployeeCode: string;
  employeeName: string;
  date: string;
  punches: string[];
}

export interface MachineLogImportResult {
  message: string;
  created: number;
  updated: number;
}
