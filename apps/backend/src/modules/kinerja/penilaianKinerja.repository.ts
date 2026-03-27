
import { openDb } from '../../config/db';
import { PenilaianKinerja, SelfAssessmentKpi } from './penilaianKinerja.model';
import {
  CreatePerformanceReviewPayload,
  PerformanceReviewKpiSnapshot,
  SubmitSelfAssessmentPayload,
  UpdatePerformanceReviewPayload
} from './kinerja.types';

type ReviewRow = Omit<PenilaianKinerja, 'kpis' | 'selfAssessmentKpis'> & {
  kpis: string | null;
  selfAssessmentKpis: string | null;
};

const parseJsonField = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const mapRow = (row: ReviewRow | undefined | null): PenilaianKinerja | null => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    kpis: parseJsonField<PerformanceReviewKpiSnapshot[]>(row.kpis, []),
    selfAssessmentKpis: parseJsonField<SelfAssessmentKpi[] | null>(row.selfAssessmentKpis, null)
  };
};

const mapRows = (rows: ReviewRow[]) => rows.map((row) => mapRow(row)).filter(Boolean) as PenilaianKinerja[];

const calculateOverallScore = (kpis: PerformanceReviewKpiSnapshot[]) => {
  if (!kpis.length) {
    return 0;
  }

  const totalWeight = kpis.reduce((sum, kpi) => sum + (kpi.weight || 0), 0);
  const effectiveWeight = totalWeight > 0 ? totalWeight : kpis.length;
  const weightedScore = kpis.reduce((sum, kpi) => sum + ((kpi.score || 0) * (kpi.weight || 0)), 0);

  return parseFloat((weightedScore / effectiveWeight).toFixed(2));
};

export const PenilaianKinerjaRepository = {
  async findAll(supervisorId?: string): Promise<PenilaianKinerja[]> {
    const db = await openDb();

    if (supervisorId) {
      const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', supervisorId);
      if (!supervisor || !supervisor.jabatan_id) return [];

      const rows = await db.all(`
        SELECT pk.* 
        FROM penilaian_kinerja pk
        JOIN pegawai p ON pk.employeeId = p.id
        JOIN jabatan j ON p.jabatan_id = j.id
        WHERE j.parent_id = ?
      `, supervisor.jabatan_id) as ReviewRow[];
      return mapRows(rows);
    }

    const rows = await db.all('SELECT * FROM penilaian_kinerja') as ReviewRow[];
    return mapRows(rows);
  },

  async findById(id: string): Promise<PenilaianKinerja | null> {
    const db = await openDb();
    const row = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id) as ReviewRow | undefined;
    return mapRow(row);
  },

  async findByEmployeeId(employeeId: string): Promise<PenilaianKinerja[]> {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM penilaian_kinerja WHERE employeeId = ? ORDER BY createdAt DESC', employeeId) as ReviewRow[];
    return mapRows(rows);
  },

  async create(data: CreatePerformanceReviewPayload): Promise<PenilaianKinerja> {
    const db = await openDb();
    const kpis = data.kpis || [];
    const overallScore = calculateOverallScore(kpis);
    let employeeName = data.employeeName || '';

    if (!employeeName && data.employeeId) {
      const employee = await db.get('SELECT name FROM pegawai WHERE id = ?', data.employeeId);
      employeeName = employee ? employee.name : '';
    }

    const newId = data.id || `pr-${Date.now()}`;
    const reviewData = {
      id: newId,
      employeeId: data.employeeId,
      employeeName,
      period: data.period,
      reviewerName: data.reviewerName,
      reviewDate: data.reviewDate,
      overallScore,
      status: data.status || 'Draft',
      strengths: data.strengths,
      areasForImprovement: data.areasForImprovement,
      employeeFeedback: data.employeeFeedback,
      kpis: JSON.stringify(kpis),
      penilaiId: data.penilaiId || null,
      selfAssessmentDeadline: data.selfAssessmentDeadline || null,
      createdAt: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO penilaian_kinerja (id, employeeId, employeeName, period, reviewerName, reviewDate, overallScore, status, strengths, areasForImprovement, employeeFeedback, kpis, penilaiId, selfAssessmentDeadline, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      Object.values(reviewData)
    );

    const newRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', newId) as ReviewRow | undefined;
    return mapRow(newRow)!;
  },

  async update(id: string, data: UpdatePerformanceReviewPayload): Promise<PenilaianKinerja> {
    const db = await openDb();
    const kpis = data.kpis || [];
    const overallScore = calculateOverallScore(kpis);
    const reviewData = {
      ...data,
      overallScore,
      kpis: JSON.stringify(kpis),
      status: data.status || 'Draft'
    };

    const setClause = Object.keys(reviewData).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(reviewData), id];

    const result = await db.run(`UPDATE penilaian_kinerja SET ${setClause} WHERE id = ?`, values);
    if (result.changes === 0) throw new Error('Performance review not found');

    const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id) as ReviewRow | undefined;
    return mapRow(updatedRow)!;
  },

  async updateFeedback(id: string, feedback: string) {
    const db = await openDb();
    const result = await db.run(
      `UPDATE penilaian_kinerja SET employeeFeedback = ? WHERE id = ?`,
      feedback, id
    );
    if (result.changes === 0) throw new Error('Review not found');
    return this.findById(id);
  },

  async updateStatus(id: string, status: PenilaianKinerja['status'], selfAssessmentDeadline?: string | null) {
    const db = await openDb();
    const result = await db.run(
      `UPDATE penilaian_kinerja
       SET status = ?, selfAssessmentDeadline = COALESCE(?, selfAssessmentDeadline)
       WHERE id = ?`,
      status,
      selfAssessmentDeadline || null,
      id
    );

    if (result.changes === 0) {
      throw new Error('Performance review not found');
    }

    return this.findById(id);
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM penilaian_kinerja WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  },

  // New method for finding upcoming performance reviews
  async findUpcomingReviews() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT * FROM penilaian_kinerja 
      WHERE status = 'Scheduled'
      AND reviewDate BETWEEN date('now') AND date('now', '+30 days')
      ORDER BY reviewDate ASC
    `) as ReviewRow[];
    return mapRows(rows);
  },

  async submitSelfAssessment(id: string, data: SubmitSelfAssessmentPayload) {
    const db = await openDb();

    const saKpis = data.selfAssessmentKpis || [];
    let selfScore = 0;
    if (saKpis.length > 0) {
      const totalWeight = saKpis.reduce((sum: number, kpi: any) => sum + (kpi.weight || 1), 0);
      const weightedScore = saKpis.reduce((sum: number, kpi: any) => {
        const w = kpi.weight || 1;
        return sum + ((kpi.selfScore || 0) * w);
      }, 0);
      selfScore = totalWeight > 0
        ? parseFloat((weightedScore / totalWeight).toFixed(2))
        : 0;
    }

    const selfAssessmentDate = data.selfAssessmentStatus === 'submitted' ? new Date().toISOString() : null;

    const result = await db.run(
      `UPDATE penilaian_kinerja SET 
        selfAssessmentScore = ?,
        selfAssessmentKpis = ?,
        selfAssessmentStrengths = ?,
        selfAssessmentAreas = ?,
        selfAssessmentDate = COALESCE(?, selfAssessmentDate),
        selfAssessmentStatus = ?
      WHERE id = ?`,
      [
        selfScore,
        JSON.stringify(saKpis),
        data.selfAssessmentStrengths || null,
        data.selfAssessmentAreas || null,
        selfAssessmentDate,
        data.selfAssessmentStatus,
        id
      ]
    );
    if (result.changes === 0) throw new Error('Performance review not found');

    const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id) as ReviewRow | undefined;
    return mapRow(updatedRow)!;
  }
};
