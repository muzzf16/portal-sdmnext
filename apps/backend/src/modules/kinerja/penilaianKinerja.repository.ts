
// src/modules/kinerja/penilaianKinerja.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results
const parseJsonFields = (rows: any[]) => {
  return rows.map(row => ({
    ...row,
    kpis: row.kpis ? JSON.parse(row.kpis) : [],
    selfAssessmentKpis: row.selfAssessmentKpis ? JSON.parse(row.selfAssessmentKpis) : null,
  }));
};

export const PenilaianKinerjaRepository = {
  async findAll(supervisorId?: string) {
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
      `, supervisor.jabatan_id);
      return parseJsonFields(rows);
    }

    const rows = await db.all('SELECT * FROM penilaian_kinerja');
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM penilaian_kinerja WHERE employeeId = ?', employeeId);
    return parseJsonFields(rows);
  },

  async create(data: any) {
    const db = await openDb();
    // Calculate overall score based on KPIs
    const kpis = data.kpis || [];
    let overallScore = 0; // Default to 0 if no KPIs

    if (kpis.length > 0) {
      const totalWeight = kpis.reduce((sum: number, kpi: any) => sum + (kpi.weight || 0), 0);
      // Avoid division by zero - if totalWeight is 0, use the count of KPIs as the denominator
      const effectiveWeight = totalWeight > 0 ? totalWeight : kpis.length;
      const weightedScore = kpis.reduce((sum: number, kpi: any) => sum + ((kpi.score || 0) * (kpi.weight || 0)), 0);

      overallScore = parseFloat((weightedScore / effectiveWeight).toFixed(2));
    }

    // Get employee name if not provided
    let employeeName = data.employeeName || '';
    if (!employeeName && data.employeeId) {
      const employeeDb = await openDb();
      const employee = await employeeDb.get('SELECT name FROM pegawai WHERE id = ?', data.employeeId);
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
      penilaiId: data.penilaiId || null, // Store as null if not provided
      createdAt: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO penilaian_kinerja (id, employeeId, employeeName, period, reviewerName, reviewDate, overallScore, status, strengths, areasForImprovement, employeeFeedback, kpis, penilaiId, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      Object.values(reviewData)
    );

    const newRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async update(id: string, data: any) {
    const db = await openDb();
    // Calculate overall score based on KPIs
    const kpis = data.kpis || [];
    let overallScore = 0; // Default to 0 if no KPIs

    if (kpis.length > 0) {
      const totalWeight = kpis.reduce((sum: number, kpi: any) => sum + (kpi.weight || 0), 0);
      // Avoid division by zero - if totalWeight is 0, use the count of KPIs as the denominator
      const effectiveWeight = totalWeight > 0 ? totalWeight : kpis.length;
      const weightedScore = kpis.reduce((sum: number, kpi: any) => sum + ((kpi.score || 0) * (kpi.weight || 0)), 0);

      overallScore = parseFloat((weightedScore / effectiveWeight).toFixed(2));
    }

    const reviewData = {
      ...data,
      overallScore,
      kpis: JSON.stringify(kpis),
      status: data.status || 'Draft'  // Ensure status is set even if not provided
    };

    delete reviewData.id; // Prevent updating the primary key

    const setClause = Object.keys(reviewData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(reviewData), id];

    const result = await db.run(`UPDATE penilaian_kinerja SET ${setClause} WHERE id = ?`, values);
    if (result.changes === 0) throw new Error('Performance review not found');

    const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
    return parseJsonFields([updatedRow])[0];
  },

  async updateFeedback(id: string, feedback: string) {
    const db = await openDb();
    const result = await db.run(
      `UPDATE penilaian_kinerja SET employeeFeedback = ? WHERE id = ?`,
      feedback, id
    );
    if (result.changes === 0) throw new Error('Review not found');
    return { message: 'Feedback submitted' };
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
    `);
    return parseJsonFields(rows);
  },

  // Self-Assessment: submit or save draft
  async submitSelfAssessment(id: string, data: {
    selfAssessmentKpis: any[];
    selfAssessmentStrengths: string;
    selfAssessmentAreas: string;
    selfAssessmentStatus: 'draft' | 'submitted';
  }) {
    const db = await openDb();

    // G8: Calculate self-assessment WEIGHTED score (using KPI weights)
    const saKpis = data.selfAssessmentKpis || [];
    let selfScore = 0;
    if (saKpis.length > 0) {
      const totalWeight = saKpis.reduce((sum: number, k: any) => sum + (k.weight || 1), 0);
      const weightedScore = saKpis.reduce((sum: number, k: any) => {
        const w = k.weight || 1;
        return sum + ((k.selfScore || 0) * w);
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

    const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
    return parseJsonFields([updatedRow])[0];
  }
};
