"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kpi_repository_1 = require("./kpi.repository");
const workload_repository_1 = require("../workload/workload.repository");
const activity_library_repository_1 = require("../activity-library/activity-library.repository");
const errors_1 = require("../../utils/errors");
const db_1 = require("../../config/db");
class KpiService {
    static calculateScore(targetValue, actualValue, targetUnit) {
        if (targetValue === 0)
            return 0;
        if (targetUnit === 'hari') {
            const ratio = targetValue / actualValue;
            if (actualValue <= targetValue)
                return 5;
            if (ratio >= 0.8)
                return 4;
            if (ratio >= 0.6)
                return 3;
            if (ratio >= 0.4)
                return 2;
            return 1;
        }
        const ratio = actualValue / targetValue;
        if (ratio >= 1.0)
            return 5;
        if (ratio >= 0.8)
            return 4;
        if (ratio >= 0.6)
            return 3;
        if (ratio >= 0.4)
            return 2;
        return 1;
    }
    static async getAll(filters) {
        try {
            return await kpi_repository_1.KpiRepository.findAll(filters);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving KPI targets: ${error.message}`, 500);
        }
    }
    static async getByEmployeeId(employeeId) {
        try {
            return await kpi_repository_1.KpiRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving KPIs for employee: ${error.message}`, 500);
        }
    }
    static async getByEmployeePeriod(employeeId, period) {
        try {
            return await kpi_repository_1.KpiRepository.findByEmployeePeriod(employeeId, period);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving KPIs: ${error.message}`, 500);
        }
    }
    static async getById(id) {
        const item = await kpi_repository_1.KpiRepository.findById(id);
        if (!item)
            throw new errors_1.AppError('KPI target not found', 404);
        return item;
    }
    static async create(data) {
        if (!data.employeeId || !data.kpiName || !data.period) {
            throw new errors_1.AppError('employeeId, kpiName, and period are required', 400);
        }
        if (data.actualValue && data.targetValue) {
            data.score = this.calculateScore(data.targetValue, data.actualValue, data.targetUnit || '');
        }
        try {
            if ((!data.source || data.source === 'manual') && !data.abkActivityId) {
                const db = await (0, db_1.openDb)();
                const cleanName = data.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
                let match = await db.get('SELECT id FROM activity_library WHERE LOWER(activityName) = LOWER(?) LIMIT 1', cleanName);
                if (!match) {
                    const activityId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const now = new Date().toISOString();
                    await db.run(`INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, activityId, 'Semua Jabatan', '', cleanName, 60, data.targetUnit === 'jumlah' ? 'Kali' : (data.targetUnit || 'Selesai'), 'Tugas Khusus KPI', now);
                    data.abkActivityId = activityId;
                }
                else {
                    data.abkActivityId = match.id;
                }
            }
            return await kpi_repository_1.KpiRepository.create(data);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating KPI target: ${error.message}`, 500);
        }
    }
    static async update(id, data) {
        if (data.actualValue !== undefined && data.targetValue !== undefined) {
            data.score = this.calculateScore(data.targetValue, data.actualValue, data.targetUnit || '');
        }
        try {
            const updated = await kpi_repository_1.KpiRepository.update(id, data);
            if (!updated)
                throw new errors_1.AppError('KPI target not found', 404);
            return updated;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error updating KPI target: ${error.message}`, 500);
        }
    }
    static async updateActualValue(id, actualValue, evidenceUrl) {
        const existing = await kpi_repository_1.KpiRepository.findById(id);
        if (!existing)
            throw new errors_1.AppError('KPI target not found', 404);
        const score = this.calculateScore(existing.targetValue, actualValue, existing.targetUnit || '');
        try {
            return await kpi_repository_1.KpiRepository.updateActualValue(id, actualValue, score, evidenceUrl);
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating actual value: ${error.message}`, 500);
        }
    }
    static async updateEvidence(id, evidenceUrl) {
        const existing = await kpi_repository_1.KpiRepository.findById(id);
        if (!existing)
            throw new errors_1.AppError('KPI target not found', 404);
        try {
            return await kpi_repository_1.KpiRepository.updateEvidence(id, evidenceUrl);
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating evidence: ${error.message}`, 500);
        }
    }
    static async delete(id) {
        try {
            const deleted = await kpi_repository_1.KpiRepository.delete(id);
            if (!deleted)
                throw new errors_1.AppError('KPI target not found', 404);
            return { message: 'KPI target deleted successfully' };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error deleting KPI target: ${error.message}`, 500);
        }
    }
    static async generateFromAbk(employeeId, year, period) {
        try {
            const analysis = await workload_repository_1.WorkloadRepository.findAnalysisByEmployeeYear(employeeId, year);
            if (!analysis) {
                throw new errors_1.AppError('Workload analysis not found for this employee/year. Please create ABK first.', 404);
            }
            const fullAnalysis = await workload_repository_1.WorkloadRepository.findAnalysisById(analysis.id);
            if (!fullAnalysis || !fullAnalysis.items || fullAnalysis.items.length === 0) {
                throw new errors_1.AppError('No workload items found in ABK analysis', 404);
            }
            const existingKpis = await kpi_repository_1.KpiRepository.findByEmployeePeriod(employeeId, period);
            const existingNames = new Set(existingKpis.map((k) => k.kpiName.toLowerCase()));
            const existingTotalWeight = existingKpis.reduce((sum, k) => sum + (k.weight || 0), 0);
            const libraryActivities = await activity_library_repository_1.ActivityLibraryRepository.findByPosition(fullAnalysis.position || '');
            const uniqueItemsMap = new Map();
            for (const item of fullAnalysis.items) {
                const key = item.activityName.toLowerCase();
                if (!uniqueItemsMap.has(key) || (item.totalMinutes || 0) > (uniqueItemsMap.get(key).totalMinutes || 0)) {
                    uniqueItemsMap.set(key, item);
                }
            }
            const uniqueItems = Array.from(uniqueItemsMap.values());
            const topItems = uniqueItems
                .sort((a, b) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
                .filter((item) => !existingNames.has(`penyelesaian ${item.activityName}`.toLowerCase()))
                .slice(0, 5);
            if (topItems.length === 0) {
                throw new errors_1.AppError('Semua aktivitas ABK sudah ada di KPI untuk periode ini.', 400);
            }
            const availableWeight = Math.max(0, 100 - existingTotalWeight);
            if (availableWeight <= 0) {
                throw new errors_1.AppError('Total bobot KPI sudah mencapai 100%. Hapus atau kurangi bobot KPI yang ada terlebih dahulu.', 400);
            }
            const weightPerItem = Math.floor(availableWeight / topItems.length);
            const kpiTargets = [];
            for (let i = 0; i < topItems.length; i++) {
                const item = topItems[i];
                let abkActivityId = item.activityId || null;
                if (!abkActivityId) {
                    const exactMatch = libraryActivities.find((la) => la.activityName.toLowerCase() === item.activityName.toLowerCase());
                    if (exactMatch) {
                        abkActivityId = exactMatch.id;
                    }
                    else {
                        const fuzzyMatch = libraryActivities.find((la) => la.activityName.toLowerCase().includes(item.activityName.toLowerCase())
                            || item.activityName.toLowerCase().includes(la.activityName.toLowerCase()));
                        abkActivityId = fuzzyMatch?.id || null;
                    }
                }
                let periodFactor = 1;
                if (period.match(/-S[12]$/i))
                    periodFactor = 0.5;
                else if (period.match(/-Q[1-4]$/i))
                    periodFactor = 0.25;
                else if (period.match(/-\d{2}$/))
                    periodFactor = 1 / 12;
                const annualFrequency = (item.freqDaily || 0) * 264 +
                    (item.freqWeekly || 0) * 52 +
                    (item.freqMonthly || 0) * 12 +
                    (item.freqQuarterly || 0) * 4 +
                    (item.freqSemester || 0) * 2 +
                    (item.freqYearly || 0);
                const targetFrequency = Math.ceil(annualFrequency * periodFactor);
                const weight = i === topItems.length - 1
                    ? (availableWeight - weightPerItem * (topItems.length - 1))
                    : weightPerItem;
                const kpi = await kpi_repository_1.KpiRepository.create({
                    employeeId,
                    period,
                    kpiName: `Penyelesaian ${item.activityName}`,
                    targetValue: targetFrequency,
                    targetUnit: 'jumlah',
                    weight,
                    status: 'active',
                    source: 'abk',
                    category: 'process',
                    abkActivityId: abkActivityId,
                    notes: `Auto-generated dari ABK. Durasi standar: ${item.durationMinutes} menit.`
                });
                kpiTargets.push(kpi);
            }
            return kpiTargets;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error generating KPI from ABK: ${error.message}`, 500);
        }
    }
    static async syncRealisasiFromWla(employeeId, period) {
        try {
            const { startDate, endDate } = this.parsePeriodToDateRange(period);
            const kpis = await kpi_repository_1.KpiRepository.findByEmployeePeriod(employeeId, period);
            if (kpis.length === 0) {
                throw new errors_1.AppError('Tidak ada KPI target untuk pegawai dan periode ini.', 400);
            }
            const db = await (0, db_1.openDb)();
            const allActivities = await db.all('SELECT id, activityName FROM activity_library');
            const results = [];
            for (const kpi of kpis) {
                let activityId = kpi.abkActivityId;
                if (!activityId) {
                    const cleanName = kpi.kpiName
                        .replace(/^Penyelesaian\s+/i, '')
                        .trim();
                    let match = allActivities.find((a) => a.activityName.toLowerCase() === cleanName.toLowerCase());
                    if (!match) {
                        match = allActivities.find((a) => a.activityName.toLowerCase().includes(cleanName.toLowerCase())
                            || cleanName.toLowerCase().includes(a.activityName.toLowerCase()));
                    }
                    if (match) {
                        activityId = match.id;
                        await db.run('UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?', activityId, new Date().toISOString(), kpi.id);
                    }
                }
                if (!activityId) {
                    const cleanName = kpi.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
                    const newId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const now = new Date().toISOString();
                    await db.run(`INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, newId, 'Semua Jabatan', '', cleanName, 60, kpi.targetUnit === 'jumlah' ? 'Kali' : (kpi.targetUnit || 'Selesai'), 'Tugas Khusus KPI', now);
                    activityId = newId;
                    await db.run('UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?', activityId, now, kpi.id);
                }
                const row = await db.get(`SELECT 
                        COALESCE(SUM(l.frekuensi), 0) as total_frekuensi,
                        COALESCE(SUM(l.total_durasi_terhitung), 0) as total_durasi,
                        COUNT(*) as jumlah_hari
                     FROM log_aktivitas_harian l
                     WHERE l.id_pegawai = ?
                       AND l.id_activity_library = ?
                       AND l.tanggal >= ? AND l.tanggal <= ?
                       AND (l.status_approval IS NULL OR l.status_approval != 'rejected')`, employeeId, activityId, startDate, endDate);
                const actualValue = row?.total_frekuensi || 0;
                const score = this.calculateScore(kpi.targetValue, actualValue, kpi.targetUnit || '');
                await kpi_repository_1.KpiRepository.updateActualValue(kpi.id, actualValue, score);
                results.push({
                    kpiId: kpi.id,
                    kpiName: kpi.kpiName,
                    targetValue: kpi.targetValue,
                    actualValue,
                    score,
                    totalDurasi: row?.total_durasi || 0,
                    jumlahHari: row?.jumlah_hari || 0
                });
            }
            const synced = results.filter((r) => !r.skipped).length;
            const skipped = results.filter((r) => r.skipped).length;
            return {
                synced,
                skipped,
                period,
                startDate,
                endDate,
                details: results
            };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error syncing realisasi from WLA: ${error.message}`, 500);
        }
    }
    static parsePeriodToDateRange(period) {
        const semesterMatch = period.match(/^(\d{4})-S([12])$/i);
        if (semesterMatch) {
            const year = semesterMatch[1];
            if (semesterMatch[2] === '1') {
                return { startDate: `${year}-01-01`, endDate: `${year}-06-30` };
            }
            else {
                return { startDate: `${year}-07-01`, endDate: `${year}-12-31` };
            }
        }
        const quarterMatch = period.match(/^(\d{4})-Q([1-4])$/i);
        if (quarterMatch) {
            const year = quarterMatch[1];
            const q = parseInt(quarterMatch[2]);
            const startMonth = String((q - 1) * 3 + 1).padStart(2, '0');
            const endMonth = String(q * 3).padStart(2, '0');
            const lastDay = new Date(parseInt(year), q * 3, 0).getDate();
            return { startDate: `${year}-${startMonth}-01`, endDate: `${year}-${endMonth}-${lastDay}` };
        }
        const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
        if (monthMatch) {
            const year = monthMatch[1];
            const month = monthMatch[2];
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
            return { startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${lastDay}` };
        }
        const yearMatch = period.match(/^(\d{4})/);
        const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
        return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }
}
exports.default = KpiService;
//# sourceMappingURL=kpi.service.js.map