"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kpi_repository_1 = require("./kpi.repository");
const workload_repository_1 = require("../workload/workload.repository");
const activity_library_repository_1 = require("../activity-library/activity-library.repository");
const errors_1 = require("../../utils/errors");
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
    static async updateActualValue(id, actualValue) {
        const existing = await kpi_repository_1.KpiRepository.findById(id);
        if (!existing)
            throw new errors_1.AppError('KPI target not found', 404);
        const score = this.calculateScore(existing.targetValue, actualValue, existing.targetUnit || '');
        try {
            return await kpi_repository_1.KpiRepository.updateActualValue(id, actualValue, score);
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating actual value: ${error.message}`, 500);
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
            const libraryActivities = await activity_library_repository_1.ActivityLibraryRepository.findByPosition(fullAnalysis.position || '');
            const kpiTargets = [];
            const totalWeight = Math.floor(100 / Math.min(fullAnalysis.items.length, 5));
            const topItems = [...fullAnalysis.items]
                .sort((a, b) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
                .slice(0, 5);
            for (let i = 0; i < topItems.length; i++) {
                const item = topItems[i];
                const libraryMatch = libraryActivities.find((la) => la.activityName.toLowerCase().includes(item.activityName.toLowerCase().substring(0, 10)));
                const targetFrequency = (item.freqDaily || 0) * 264 +
                    (item.freqWeekly || 0) * 52 +
                    (item.freqMonthly || 0) * 12 +
                    (item.freqQuarterly || 0) * 4 +
                    (item.freqSemester || 0) * 2 +
                    (item.freqYearly || 0);
                const kpi = await kpi_repository_1.KpiRepository.create({
                    employeeId,
                    period,
                    kpiName: `Penyelesaian ${item.activityName}`,
                    targetValue: targetFrequency,
                    targetUnit: 'jumlah',
                    weight: i === topItems.length - 1 ? (100 - totalWeight * (topItems.length - 1)) : totalWeight,
                    status: 'active',
                    source: 'abk',
                    abkActivityId: libraryMatch?.id || null,
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
}
exports.default = KpiService;
//# sourceMappingURL=kpi.service.js.map