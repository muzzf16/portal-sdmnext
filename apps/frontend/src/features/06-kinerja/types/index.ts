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
  activityId?: string;
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
  status: 'draft' | 'waiting_approval' | 'active' | 'completed' | 'cancelled';
  source: 'abk' | 'manual';
  category: 'process' | 'outcome' | 'strategic';
  abkActivityId?: string;
  notes?: string;
  evidenceUrl?: string;
  created_at?: string;
  updated_at?: string;
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
  statusSummary: 'empty' | 'draft' | 'waiting_approval' | 'active' | 'completed';
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

export interface LogAktivitasHarian {
  id_log: number;
  id_pegawai: number;
  tanggal: string;
  id_activity_library: number;
  frekuensi: number;
  total_durasi_terhitung: number;
  status_approval: 'pending' | 'approved' | 'rejected';
  catatan?: string;
  lampiran?: string;
  created_at?: string;

  // Joined fields
  activityName?: string;
  durationMinutes?: number;
  outputUnit?: string;
  category?: string;
}

export interface AdminWlaSummary {
  id_pegawai: number;
  nama_lengkap: string;
  nip: string;
  jabatan: string;
  departemen: string;
  total_aktivitas: number;
  total_durasi_menit: number;
  jumlah_log: number;
}
