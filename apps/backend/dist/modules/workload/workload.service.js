"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workload_repository_1 = require("./workload.repository");
const errors_1 = require("../../utils/errors");
const DAYS_IN_YEAR = 264;
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;
const HOURS_PER_DAY = 8;
const AVAILABLE_YEARLY_MINUTES = DAYS_IN_YEAR * HOURS_PER_DAY * 60;
class WorkloadService {
    static calculateFTE(totalYearlyMinutes) {
        const ftePercentage = parseFloat(((totalYearlyMinutes / AVAILABLE_YEARLY_MINUTES) * 100).toFixed(1));
        const hoursPerDay = parseFloat((totalYearlyMinutes / DAYS_IN_YEAR / 60).toFixed(2));
        let fteStatus;
        if (ftePercentage > 100) {
            fteStatus = 'Overload';
        }
        else if (ftePercentage >= 80) {
            fteStatus = 'Normal';
        }
        else {
            fteStatus = 'Underload';
        }
        return { ftePercentage, fteStatus, hoursPerDay };
    }
    static calculateTotalMinutes(item) {
        return (item.durationMinutes || 0) * ((item.freqDaily || 0) * DAYS_IN_YEAR +
            (item.freqWeekly || 0) * WEEKS_IN_YEAR +
            (item.freqMonthly || 0) * MONTHS_IN_YEAR +
            (item.freqQuarterly || 0) * 4 +
            (item.freqSemester || 0) * 2 +
            (item.freqYearly || 0));
    }
    static async getAnalysis(employeeId, year) {
        const header = await workload_repository_1.WorkloadRepository.findAnalysisByEmployeeYear(employeeId, year);
        if (!header)
            return null;
        return await workload_repository_1.WorkloadRepository.findAnalysisById(header.id);
    }
    static async getAnalysisById(id) {
        const analysis = await workload_repository_1.WorkloadRepository.findAnalysisById(id);
        if (!analysis)
            throw new errors_1.AppError('Workload analysis not found', 404);
        return analysis;
    }
    static async saveAnalysis(data) {
        if (!data.employeeId) {
            throw new errors_1.AppError('employeeId is required', 400);
        }
        if (!data.year) {
            throw new errors_1.AppError('year is required', 400);
        }
        let analysis = await workload_repository_1.WorkloadRepository.findAnalysisByEmployeeYear(data.employeeId, data.year);
        let totalYearlyMinutes = 0;
        const itemsWithTotals = data.items.map((item) => {
            const total = this.calculateTotalMinutes(item);
            totalYearlyMinutes += total;
            return { ...item, totalMinutes: total };
        });
        if (!analysis) {
            analysis = await workload_repository_1.WorkloadRepository.createAnalysis({
                employeeId: data.employeeId,
                year: data.year,
                position: data.position,
                department: data.department,
                totalYearlyMinutes,
                status: data.status || 'draft'
            });
        }
        else {
            await workload_repository_1.WorkloadRepository.updateAnalysisHeader(analysis.id, {
                totalYearlyMinutes,
                status: data.status || analysis.status
            });
        }
        await workload_repository_1.WorkloadRepository.clearItems(analysis.id);
        for (const item of itemsWithTotals) {
            await workload_repository_1.WorkloadRepository.createItem({ ...item, analysisId: analysis.id });
        }
        return await this.getAnalysisById(analysis.id);
    }
}
exports.default = WorkloadService;
//# sourceMappingURL=workload.service.js.map