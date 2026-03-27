export interface PerformanceCycleBatchPayload {
  period: string;
  employeeIds?: string[];
  selfAssessmentDeadline?: string;
}

export interface PerformanceCycleBatchResult {
  period: string;
  processed: number;
  succeeded: number;
  skipped: number;
  failed: number;
  details: Array<{
    employeeId: string;
    employeeName?: string;
    status: 'success' | 'skipped' | 'failed';
    message: string;
  }>;
}
