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

export interface AttendanceClockInPayload {
  employeeId: string;
  employeeName: string;
}

export interface SkippedLogEntry {
  machineEmployeeCode: string;
  employeeName: string;
  date: string;
}

export interface AttendanceUploadResult {
  success?: boolean;
  message: string;
  created: number;
  updated: number;
  skipped: number;
  skippedEntries: SkippedLogEntry[];
}
