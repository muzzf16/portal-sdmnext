export type KpiStatus = 'draft' | 'waiting_approval' | 'active' | 'completed' | 'cancelled';
export type KpiSource = 'abk' | 'manual';
export type KpiCategory = 'process' | 'outcome' | 'strategic';
export type KpiSummaryStatus = 'empty' | 'draft' | 'waiting_approval' | 'active' | 'completed';

export interface KpiTarget {
  id: string;
  employeeId: string;
  period: string;
  kpiName: string;
  targetValue: number;
  targetUnit: string;
  weight: number;
  actualValue: number;
  score: number;
  status: KpiStatus;
  source: KpiSource;
  category: KpiCategory;
  abkActivityId?: string | null;
  notes?: string;
  evidenceUrl?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KpiFilters {
  employeeId?: string;
  period?: string;
  status?: string;
}

export interface KpiSummaryFilters {
  employeeId?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface KpiSummaryEmployeeScope {
  employeeId?: string;
  employeeIds?: string[];
}

export interface KpiSummaryRecord {
  id: string;
  employeeId: string;
  period: string;
  weight: number;
  score: number;
  status: KpiStatus;
  employeeName: string;
  nip: string;
  department: string;
  position: string;
}

export interface KpiSummaryEmployee {
  employeeId: string;
  employeeName: string;
  nip: string;
  department: string;
  position: string;
}

export interface KpiSummaryRow {
  employeeId: string;
  employeeName: string;
  nip: string;
  department: string;
  position: string;
  totalKpi: number;
  totalWeight: number;
  weightedScore: number;
  draftCount: number;
  waitingApprovalCount: number;
  activeCount: number;
  completedCount: number;
  statusSummary: KpiSummaryStatus;
}

export interface CreateKpiPayload {
  id?: string;
  employeeId: string;
  period: string;
  kpiName: string;
  targetValue: number;
  targetUnit?: string;
  weight?: number;
  actualValue?: number;
  score?: number;
  status?: KpiStatus;
  source?: KpiSource;
  category?: KpiCategory;
  abkActivityId?: string | null;
  notes?: string;
  evidenceUrl?: string;
}

export interface UpdateKpiPayload extends Partial<CreateKpiPayload> {}

export interface KpiSyncResultDetail {
  kpiId: string;
  kpiName: string;
  targetValue: number;
  actualValue: number;
  score: number;
  totalDurasi: number;
  jumlahHari: number;
}
