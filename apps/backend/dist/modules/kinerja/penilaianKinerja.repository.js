"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenilaianKinerjaRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows.map(row => ({
        ...row,
        kpis: row.kpis ? JSON.parse(row.kpis) : [],
        selfAssessmentKpis: row.selfAssessmentKpis ? JSON.parse(row.selfAssessmentKpis) : null,
    }));
};
exports.PenilaianKinerjaRepository = {
    async findAll(supervisorId) {
        const db = await (0, db_1.openDb)();
        if (supervisorId) {
            const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', supervisorId);
            if (!supervisor || !supervisor.jabatan_id)
                return [];
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
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM penilaian_kinerja WHERE employeeId = ?', employeeId);
        return parseJsonFields(rows);
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
        const kpis = data.kpis || [];
        let overallScore = 0;
        if (kpis.length > 0) {
            const totalWeight = kpis.reduce((sum, kpi) => sum + (kpi.weight || 0), 0);
            const effectiveWeight = totalWeight > 0 ? totalWeight : kpis.length;
            const weightedScore = kpis.reduce((sum, kpi) => sum + ((kpi.score || 0) * (kpi.weight || 0)), 0);
            overallScore = parseFloat((weightedScore / effectiveWeight).toFixed(2));
        }
        let employeeName = data.employeeName || '';
        if (!employeeName && data.employeeId) {
            const employeeDb = await (0, db_1.openDb)();
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
            penilaiId: data.penilaiId || null,
            createdAt: new Date().toISOString()
        };
        await db.run('INSERT INTO penilaian_kinerja (id, employeeId, employeeName, period, reviewerName, reviewDate, overallScore, status, strengths, areasForImprovement, employeeFeedback, kpis, penilaiId, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', Object.values(reviewData));
        const newRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', newId);
        return parseJsonFields([newRow])[0];
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        const kpis = data.kpis || [];
        let overallScore = 0;
        if (kpis.length > 0) {
            const totalWeight = kpis.reduce((sum, kpi) => sum + (kpi.weight || 0), 0);
            const effectiveWeight = totalWeight > 0 ? totalWeight : kpis.length;
            const weightedScore = kpis.reduce((sum, kpi) => sum + ((kpi.score || 0) * (kpi.weight || 0)), 0);
            overallScore = parseFloat((weightedScore / effectiveWeight).toFixed(2));
        }
        const reviewData = {
            ...data,
            overallScore,
            kpis: JSON.stringify(kpis),
            status: data.status || 'Draft'
        };
        delete reviewData.id;
        const setClause = Object.keys(reviewData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(reviewData), id];
        const result = await db.run(`UPDATE penilaian_kinerja SET ${setClause} WHERE id = ?`, values);
        if (result.changes === 0)
            throw new Error('Performance review not found');
        const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
        return parseJsonFields([updatedRow])[0];
    },
    async updateFeedback(id, feedback) {
        const db = await (0, db_1.openDb)();
        const result = await db.run(`UPDATE penilaian_kinerja SET employeeFeedback = ? WHERE id = ?`, feedback, id);
        if (result.changes === 0)
            throw new Error('Review not found');
        return { message: 'Feedback submitted' };
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM penilaian_kinerja WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    },
    async findUpcomingReviews() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all(`
      SELECT * FROM penilaian_kinerja 
      WHERE status = 'Scheduled'
      AND reviewDate BETWEEN date('now') AND date('now', '+30 days')
      ORDER BY reviewDate ASC
    `);
        return parseJsonFields(rows);
    },
    async submitSelfAssessment(id, data) {
        const db = await (0, db_1.openDb)();
        const saKpis = data.selfAssessmentKpis || [];
        let selfScore = 0;
        if (saKpis.length > 0) {
            const totalWeight = saKpis.reduce((sum, k) => sum + (k.weight || 1), 0);
            const weightedScore = saKpis.reduce((sum, k) => {
                const w = k.weight || 1;
                return sum + ((k.selfScore || 0) * w);
            }, 0);
            selfScore = totalWeight > 0
                ? parseFloat((weightedScore / totalWeight).toFixed(2))
                : 0;
        }
        const selfAssessmentDate = data.selfAssessmentStatus === 'submitted' ? new Date().toISOString() : null;
        const result = await db.run(`UPDATE penilaian_kinerja SET 
        selfAssessmentScore = ?,
        selfAssessmentKpis = ?,
        selfAssessmentStrengths = ?,
        selfAssessmentAreas = ?,
        selfAssessmentDate = COALESCE(?, selfAssessmentDate),
        selfAssessmentStatus = ?
      WHERE id = ?`, [
            selfScore,
            JSON.stringify(saKpis),
            data.selfAssessmentStrengths || null,
            data.selfAssessmentAreas || null,
            selfAssessmentDate,
            data.selfAssessmentStatus,
            id
        ]);
        if (result.changes === 0)
            throw new Error('Performance review not found');
        const updatedRow = await db.get('SELECT * FROM penilaian_kinerja WHERE id = ?', id);
        return parseJsonFields([updatedRow])[0];
    }
};
//# sourceMappingURL=penilaianKinerja.repository.js.map