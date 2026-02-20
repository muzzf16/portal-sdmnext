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
  coachingRecommendation?: string;
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
  ftePercentage?: number;
  fteStatus?: 'Overload' | 'Normal' | 'Underload';
  hoursPerDay?: number;
}

export interface ActivityLibraryItem {
  id: string;
  position: string;
  department: string;
  activityName: string;
  durationMinutes: number;
  outputUnit: string;
  category: string;
  created_at?: string;
}

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
  status: 'active' | 'completed' | 'cancelled';
  source: 'abk' | 'manual';
  abkActivityId?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyActivity {
  id_daily_activity: number;
  id_pegawai: number;
  id_kpi_target?: number;
  activityName: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  durasiMenit: number;
  status: 'pending' | 'approved' | 'rejected';
  evidenceUrl?: string;
  catatan?: string;
  created_at?: string;
  updated_at?: string;
}
