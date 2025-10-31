
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

export interface PenilaianKinerja {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "Q3 2024"
  reviewerName: string; // e.g., "Admin SDM"
  reviewDate: string;
  overallScore: number;
  status: string;
  strengths: string;
  areasForImprovement: string;
  employeeFeedback: string;
  kpis: Kpi[];
}
