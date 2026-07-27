export const LEAVE_STATUSES = {
  pending: 'menunggu',
  approved: 'disetujui',
  rejected: 'ditolak'
} as const;

export type LeaveStatus = (typeof LEAVE_STATUSES)[keyof typeof LEAVE_STATUSES];

export interface LeaveRequestRecord {
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

export interface LeaveRequestFilters {
  employeeId?: string;
  status?: string;
}

export interface CreateLeaveRequestInput {
  id?: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  supportingDocument?: string | null;
  rejectionReason?: string | null;
}

export interface UpdateLeaveStatusInput {
  status: string;
  rejectionReason?: string | null;
}

export interface EmployeeLeaveBalanceRecord {
  id: string;
  leaveBalance: number;
}

export interface LeaveBalanceSummary {
  jatahCuti: number;
  cutiDiambil: number;
  cutiBersama: number;
  sisaCuti: number;
  sumberJatah: string;
}

export const normalizeLeaveStatus = (status?: string | null): LeaveStatus => {
  const normalized = (status || '').trim().toLowerCase();

  if (normalized === LEAVE_STATUSES.approved) {
    return LEAVE_STATUSES.approved;
  }

  if (normalized === LEAVE_STATUSES.rejected) {
    return LEAVE_STATUSES.rejected;
  }

  return LEAVE_STATUSES.pending;
};

export const isApprovedLeaveStatus = (status?: string | null) =>
  normalizeLeaveStatus(status) === LEAVE_STATUSES.approved;

export const isAnnualLeaveType = (leaveType?: string | null) => {
  const normalized = (leaveType || '').trim().toLowerCase();
  return normalized === 'tahunan' || normalized === 'annual' || normalized === 'cuti tahunan';
};

export const shouldDeductAnnualLeave = (leaveType?: string | null, supportingDocument?: string | null) => {
  const normalized = (leaveType || '').trim().toLowerCase();

  // Cuti tahunan selalu memotong jatah cuti
  if (isAnnualLeaveType(leaveType)) {
    return true;
  }

  // Cuti sakit tanpa lampiran dokumen pendukung/SKD memotong jatah cuti tahunan
  if ((normalized === 'sakit' || normalized === 'sick' || normalized === 'cuti sakit') && !supportingDocument) {
    return true;
  }

  return false;
};
