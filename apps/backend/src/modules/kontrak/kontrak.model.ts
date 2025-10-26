// src/modules/kontrak/kontrak.model.ts

export interface Kontrak {
  id: string;
  employeeId: string;
  contractNumber: string;
  contractType: string; // e.g., 'permanent', 'temporary', 'contract'
  startDate: string;
  endDate: string;
  status: string; // e.g., 'active', 'expiring', 'expired', 'terminated'
  contractFile?: string;
  terms: string;
  salary: number;
  notes?: string;
}