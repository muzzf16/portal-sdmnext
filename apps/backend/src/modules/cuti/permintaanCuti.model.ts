
// src/modules/cuti/permintaanCuti.model.ts

export interface PermintaanCuti {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  supportingDocument?: string;
  rejectionReason?: string;
}
