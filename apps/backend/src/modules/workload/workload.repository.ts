
import { openDb } from '../../config/db';
import {
    SaveWorkloadAnalysisPayload,
    UpdateWorkloadHeaderPayload,
    WorkloadAnalysis,
    WorkloadItem,
} from './workload.types';

export const WorkloadRepository = {
    // --- Header Operations ---

    async findAnalysisByEmployeeYear(employeeId: string, year: number): Promise<WorkloadAnalysis | null> {
        const db = await openDb();
        const analysis = await db.get(
            'SELECT * FROM analisis_beban_kerja WHERE employeeId = ? AND year = ?',
            employeeId, year
        );
        return (analysis as WorkloadAnalysis | undefined) || null;
    },

    async createAnalysis(data: SaveWorkloadAnalysisPayload & { id?: string; totalYearlyMinutes: number; status: WorkloadAnalysis['status'] }): Promise<WorkloadAnalysis | null> {
        const db = await openDb();
        const id = data.id || `abk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO analisis_beban_kerja (id, employeeId, year, position, department, totalYearlyMinutes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, data.employeeId, data.year, data.position, data.department,
            data.totalYearlyMinutes || 0, data.status || 'draft', now, now
        );
        return this.findAnalysisById(id);
    },

    async findAnalysisById(id: string): Promise<WorkloadAnalysis | null> {
        const db = await openDb();
        const analysis = await db.get('SELECT * FROM analisis_beban_kerja WHERE id = ?', id) as WorkloadAnalysis | undefined;
        if (analysis) {
            analysis.items = await db.all('SELECT * FROM detail_beban_kerja WHERE analysisId = ?', id) as WorkloadItem[];
        }
        return analysis || null;
    },

    async updateAnalysisHeader(id: string, data: UpdateWorkloadHeaderPayload): Promise<WorkloadAnalysis | null> {
        const db = await openDb();
        const now = new Date().toISOString();
        await db.run(
            `UPDATE analisis_beban_kerja 
       SET position = COALESCE(NULLIF(?, ''), position), department = COALESCE(NULLIF(?, ''), department), totalYearlyMinutes = ?, status = ?, updated_at = ?
       WHERE id = ?`,
            data.position || '', data.department || '', data.totalYearlyMinutes, data.status, now, id
        );
        return this.findAnalysisById(id);
    },

    async updateAnalysisStatus(id: string, status: WorkloadAnalysis['status']): Promise<WorkloadAnalysis | null> {
        const db = await openDb();
        const now = new Date().toISOString();
        await db.run(
            `UPDATE analisis_beban_kerja SET status = ?, updated_at = ? WHERE id = ?`,
            status, now, id
        );
        return this.findAnalysisById(id);
    },

    // --- Item Operations ---

    async clearItems(analysisId: string): Promise<void> {
        const db = await openDb();
        await db.run('DELETE FROM detail_beban_kerja WHERE analysisId = ?', analysisId);
    },

    async createItem(item: WorkloadItem): Promise<void> {
        const db = await openDb();
        const id = item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.run(
            `INSERT INTO detail_beban_kerja (
        id, analysisId, activityId, activityName, outputUnit, durationMinutes, 
        freqDaily, freqWeekly, freqMonthly, freqQuarterly, freqSemester, freqYearly, totalMinutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, item.analysisId, item.activityId || null, item.activityName, item.outputUnit || '', item.durationMinutes,
            item.freqDaily || 0, item.freqWeekly || 0, item.freqMonthly || 0,
            item.freqQuarterly || 0, item.freqSemester || 0, item.freqYearly || 0, item.totalMinutes
        );
    }
};
