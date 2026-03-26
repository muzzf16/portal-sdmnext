export type LeaveStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface Cuti {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  jumlahHari?: number | null;
  reason: string;
  status: string;
  supportingDocument?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

export interface CutiFilters {
  employeeId?: string;
  status?: string;
}

export interface UpdateStatusCutiPayload {
  status: LeaveStatus;
  rejectionReason?: string;
}

export interface LeaveBalanceSummary {
  jatahCuti: number;
  cutiDiambil: number;
  cutiBersama: number;
  sisaCuti: number;
  sumberJatah: string;
}
