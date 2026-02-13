export interface Kinerja {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  reviewerName: string;
  reviewDate: string;
  overallScore: number;
  status: string;
  strengths: string;
  areasForImprovement: string;
  employeeFeedback: string;
  kpis: any[];
  penilaiId?: string;
  createdAt?: string;
}

export interface WorkLoadItem {
  id?: string;
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

export interface WorkLoadAnalysis {
  id?: string;
  employeeId: string;
  year: number;
  position: string;
  department: string;
  totalYearlyMinutes: number;
  status: 'draft' | 'submitted' | 'approved' | 'returned';
  items: WorkLoadItem[];
}
