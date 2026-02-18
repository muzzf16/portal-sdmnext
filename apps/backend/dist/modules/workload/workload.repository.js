"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkloadRepository = void 0;
const db_1 = require("../../config/db");
exports.WorkloadRepository = {
    async findAnalysisByEmployeeYear(employeeId, year) {
        const db = await (0, db_1.openDb)();
        return db.get('SELECT * FROM analisis_beban_kerja WHERE employeeId = ? AND year = ?', employeeId, year);
    },
    async createAnalysis(data) {
        const db = await (0, db_1.openDb)();
        const id = data.id || `abk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await db.run(`INSERT INTO analisis_beban_kerja (id, employeeId, year, position, department, totalYearlyMinutes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, data.employeeId, data.year, data.position, data.department, data.totalYearlyMinutes || 0, data.status || 'draft', now, now);
        return this.findAnalysisById(id);
    },
    async findAnalysisById(id) {
        const db = await (0, db_1.openDb)();
        const analysis = await db.get('SELECT * FROM analisis_beban_kerja WHERE id = ?', id);
        if (analysis) {
            analysis.items = await db.all('SELECT * FROM detail_beban_kerja WHERE analysisId = ?', id);
        }
        return analysis;
    },
    async updateAnalysisHeader(id, data) {
        const db = await (0, db_1.openDb)();
        const now = new Date().toISOString();
        await db.run(`UPDATE analisis_beban_kerja 
       SET totalYearlyMinutes = ?, status = ?, updated_at = ?
       WHERE id = ?`, data.totalYearlyMinutes, data.status, now, id);
        return this.findAnalysisById(id);
    },
    async clearItems(analysisId) {
        const db = await (0, db_1.openDb)();
        await db.run('DELETE FROM detail_beban_kerja WHERE analysisId = ?', analysisId);
    },
    async createItem(item) {
        const db = await (0, db_1.openDb)();
        const id = item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.run(`INSERT INTO detail_beban_kerja (
        id, analysisId, activityName, outputUnit, durationMinutes, 
        freqDaily, freqWeekly, freqMonthly, freqQuarterly, freqSemester, freqYearly, totalMinutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, item.analysisId, item.activityName, item.outputUnit || '', item.durationMinutes, item.freqDaily || 0, item.freqWeekly || 0, item.freqMonthly || 0, item.freqQuarterly || 0, item.freqSemester || 0, item.freqYearly || 0, item.totalMinutes);
    }
};
//# sourceMappingURL=workload.repository.js.map