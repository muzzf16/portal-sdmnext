
// src/modules/kinerja/penilaianKinerja.model.ts

export interface Kpi {
  id: string;
  metric: string;
  target: string;
  result: string;
  weight: number;
  score: number;
  notes: string;
}

export interface SelfAssessmentKpi {
  kpiId: string;
  metric: string;
  selfScore: number;
  reason: string;
}

/**
 * Status lifecycle penilaian kinerja:
 * Draft → Awaiting SA → SA Submitted → In Review → Completed → Finalized
 */
export type ReviewStatus =
  | 'Draft'              // Penilaian baru dibuat oleh admin
  | 'Awaiting SA'        // Menunggu self-assessment dari pegawai
  | 'SA Submitted'       // Self-assessment sudah dikirim
  | 'In Review'          // Atasan sedang mereview
  | 'Completed'          // Review atasan selesai, menunggu kalibrasi
  | 'Finalized';         // Final — tidak bisa diubah

// Valid transitions
export const VALID_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  'Draft': ['Awaiting SA'],
  'Awaiting SA': ['SA Submitted', 'Draft'],  // bisa kembali ke Draft
  'SA Submitted': ['In Review'],
  'In Review': ['Completed', 'SA Submitted'],  // bisa kembalikan ke SA
  'Completed': ['Finalized', 'In Review'],
  'Finalized': [],  // terminal state
};

export interface PenilaianKinerja {
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
  kpis: Kpi[];
  penilaiId: string | null;
  // Self-Assessment fields
  selfAssessmentScore: number | null;
  selfAssessmentKpis: SelfAssessmentKpi[] | null;
  selfAssessmentStrengths: string | null;
  selfAssessmentAreas: string | null;
  selfAssessmentDate: string | null;
  selfAssessmentStatus: 'belum_diisi' | 'draft' | 'submitted';
  selfAssessmentDeadline: string | null;  // ISO date — deadline untuk SA
}

