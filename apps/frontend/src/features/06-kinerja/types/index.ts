export type ReviewStatus = 'Draft' | 'Awaiting SA' | 'SA Submitted' | 'In Review' | 'Completed' | 'Finalized';

export interface PerformanceReviewKpi {
  id?: string;
  kpiId?: string;
  name: string;
  score: number;
  weight: number;
  targetValue?: number;
  actualValue?: number;
  targetUnit?: string;
  notes?: string;
}

export interface SelfAssessmentKpi {
  kpiId: string;
  metric: string;
  selfScore: number;
  reason: string;
  weight?: number;
}

export interface Kinerja {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  reviewerName: string;
  reviewDate: string;
  overallScore: number;
  status: ReviewStatus;
  strengths: string;
  areasForImprovement: string;
  employeeFeedback: string;
  kpis: PerformanceReviewKpi[];
  penilaiId?: string;
  coachingRecommendation?: string;
  is_self_assessment?: boolean;
  selfAssessmentScore?: number | null;
  selfAssessmentKpis?: SelfAssessmentKpi[] | null;
  selfAssessmentStrengths?: string | null;
  selfAssessmentAreas?: string | null;
  selfAssessmentDate?: string | null;
  selfAssessmentStatus?: 'belum_diisi' | 'draft' | 'submitted';
  selfAssessmentDeadline?: string | null;
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
  default_nominal?: number;
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

export interface PerformanceCycleBatchPayload {
  period: string;
  employeeIds?: string[];
  selfAssessmentDeadline?: string;
}

export interface PerformanceCycleBatchDetail {
  employeeId: string;
  employeeName?: string;
  status: 'success' | 'skipped' | 'failed';
  message: string;
}

export interface PerformanceCycleBatchResult {
  period: string;
  processed: number;
  succeeded: number;
  skipped: number;
  failed: number;
  details: PerformanceCycleBatchDetail[];
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
  nominal_rupiah?: number;
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
  pending_log_count: number;
  approved_log_count: number;
}

export type KreditStage = 
    | 'penerimaan' | 'slik' | 'delegasi_survey' | 'ots' 
    | 'komite_kredit' | 'mak_agunan' | 'approval_keputusan' 
    | 'admin_spk' | 'pencairan' 
    | 'selesai' | 'ditolak_cs'
    // Legacy support:
    | 'analisa' | 'verifikasi' | 'admin_pencairan';
export type KreditStatus = 'dalam_proses' | 'lengkap' | 'ditolak' | 'dicairkan';
export type BerkasStatus = 'lengkap' | 'belum_lengkap' | 'ditolak';

export interface KreditBerkas {
    id: number;
    nomor_pengajuan: string;
    nama_pengajuan: string;
    jumlah_pengajuan: number;
    jenis_kredit: string;
    no_wa_nasabah?: string;
    current_stage: KreditStage;
    overall_status: KreditStatus;
    created_by: string;
    created_at: string;
    updated_at: string;
    catatan?: string;
    tracking?: KreditBerkasTracking[];
}

export interface KreditBerkasTracking {
    id: number;
    berkas_id: number;
    stage: KreditStage;
    employee_id: string;
    employee_name?: string;
    position?: string;
    status_berkas: BerkasStatus;
    received_at: string;
    completed_at?: string;
    catatan?: string;
}

export interface CreateKreditBerkasDto {
    nama_pengajuan: string;
    jumlah_pengajuan?: number;
    jenis_kredit?: string;
    no_wa_nasabah: string;
    status_berkas: BerkasStatus;
    catatan?: string;
}

export interface UpdateKreditStageDto {
    status_berkas: BerkasStatus;
    catatan?: string;
    assigned_employee_id?: string;
}

export interface WANotificationLog {
    id: number;
    berkas_id: number;
    no_wa: string;
    nama_nasabah?: string;
    trigger_stage: string;
    message_content: string;
    status: 'pending' | 'sent' | 'failed' | 'retry';
    provider_response?: string;
    retry_count: number;
    error_message?: string;
    sent_at?: string;
    created_at: string;
}
