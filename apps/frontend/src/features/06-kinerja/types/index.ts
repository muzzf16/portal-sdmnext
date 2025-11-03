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
