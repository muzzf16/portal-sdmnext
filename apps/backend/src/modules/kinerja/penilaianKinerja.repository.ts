
// src/modules/kinerja/penilaianKinerja.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results
const parseJsonFields = (rows: any[]) => {
  return rows.map(row => ({
    ...row,
    kpis: row.kpis ? JSON.parse(row.kpis) : [],
  }));
};

export const PenilaianKinerjaRepository = {
  async findAll() {
    const db = await openDb();
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
    const totalWeight = data.kpis.reduce((sum: number, kpi: any) => sum + kpi.weight, 0) || 1;
    const weightedScore = data.kpis.reduce((sum: number, kpi: any) => sum + (kpi.score * kpi.weight), 0);
    const overallScore = parseFloat((weightedScore / totalWeight).toFixed(2));
    
    const newId = data.id || `pr-${Date.now()}`;
    const reviewData = {
      id: newId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      period: data.period,
      reviewerName: data.reviewerName,
      reviewDate: data.reviewDate,
      overallScore,
      status: data.status,
      strengths: data.strengths,
      areasForImprovement: data.areasForImprovement,
      employeeFeedback: data.employeeFeedback,
      kpis: JSON.stringify(data.kpis)
    };

    await db.run(
      'INSERT INTO penilaian_kinerja (id, employeeId, employeeName, period, reviewerName, reviewDate, overallScore, status, strengths, areasForImprovement, employeeFeedback, kpis) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      Object.values(reviewData)
    );

    const newRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async update(id: string, data: any) {
    const db = await openDb();
    // Calculate overall score based on KPIs
    const totalWeight = data.kpis.reduce((sum: number, kpi: any) => sum + kpi.weight, 0) || 1;
    const weightedScore = data.kpis.reduce((sum: number, kpi: any) => sum + (kpi.score * kpi.weight), 0);
    const overallScore = parseFloat((weightedScore / totalWeight).toFixed(2));
    
    const reviewData = {
      ...data,
      overallScore,
      kpis: JSON.stringify(data.kpis)
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
  }
};
