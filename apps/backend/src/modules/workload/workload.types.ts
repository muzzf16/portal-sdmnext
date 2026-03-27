export type WorkloadStatus = 'draft' | 'submitted' | 'approved' | 'returned';

export interface WorkloadItem {
  id?: string;
  analysisId?: string;
  activityId?: string | null;
  activityName: string;
  outputUnit?: string;
  durationMinutes: number;
  freqDaily: number;
  freqWeekly: number;
  freqMonthly: number;
  freqQuarterly: number;
  freqSemester: number;
  freqYearly: number;
  totalMinutes?: number;
}

export interface WorkloadAnalysis {
  id: string;
  employeeId: string;
  year: number;
  position: string;
  department: string;
  totalYearlyMinutes: number;
  status: WorkloadStatus;
  created_at?: string;
  updated_at?: string;
  items: WorkloadItem[];
}

export interface SaveWorkloadAnalysisPayload {
  employeeId: string;
  year: number;
  position?: string;
  department?: string;
  status?: WorkloadStatus;
  items: WorkloadItem[];
}

export interface UpdateWorkloadHeaderPayload {
  position?: string;
  department?: string;
  totalYearlyMinutes: number;
  status: WorkloadStatus;
}
