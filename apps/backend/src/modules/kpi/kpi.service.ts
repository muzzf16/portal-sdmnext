import { KpiRepository } from './kpi.repository';
import { WorkloadRepository } from '../workload/workload.repository';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';
import { AppError } from '../../utils/errors';

export default class KpiService {

    /**
     * Auto-scoring: compare actualValue vs targetValue → score 1-5
     * score 5 = 100%+ tercapai (sangat baik)
     * score 4 = 80-99% (baik)
     * score 3 = 60-79% (cukup)
     * score 2 = 40-59% (kurang)
     * score 1 = <40% (sangat kurang)
     */
    static calculateScore(targetValue: number, actualValue: number, targetUnit: string): number {
        if (targetValue === 0) return 0;

        // For "hari" unit where lower is better (e.g. closing H+3 target)
        if (targetUnit === 'hari') {
            const ratio = targetValue / actualValue; // inverse - lower actual is better
            if (actualValue <= targetValue) return 5;
            if (ratio >= 0.8) return 4;
            if (ratio >= 0.6) return 3;
            if (ratio >= 0.4) return 2;
            return 1;
        }

        // For standard metrics (higher is better: %, jumlah, etc.)
        const ratio = actualValue / targetValue;
        if (ratio >= 1.0) return 5;
        if (ratio >= 0.8) return 4;
        if (ratio >= 0.6) return 3;
        if (ratio >= 0.4) return 2;
        return 1;
    }

    static async getAll(filters?: { employeeId?: string; period?: string; status?: string }) {
        try {
            return await KpiRepository.findAll(filters);
        } catch (error: any) {
            throw new AppError(`Error retrieving KPI targets: ${error.message}`, 500);
        }
    }

    static async getByEmployeeId(employeeId: string) {
        try {
            return await KpiRepository.findByEmployeeId(employeeId);
        } catch (error: any) {
            throw new AppError(`Error retrieving KPIs for employee: ${error.message}`, 500);
        }
    }

    static async getByEmployeePeriod(employeeId: string, period: string) {
        try {
            return await KpiRepository.findByEmployeePeriod(employeeId, period);
        } catch (error: any) {
            throw new AppError(`Error retrieving KPIs: ${error.message}`, 500);
        }
    }

    static async getById(id: string) {
        const item = await KpiRepository.findById(id);
        if (!item) throw new AppError('KPI target not found', 404);
        return item;
    }

    static async create(data: any) {
        if (!data.employeeId || !data.kpiName || !data.period) {
            throw new AppError('employeeId, kpiName, and period are required', 400);
        }

        // Auto-score if actualValue provided
        if (data.actualValue && data.targetValue) {
            data.score = this.calculateScore(data.targetValue, data.actualValue, data.targetUnit || '');
        }

        try {
            return await KpiRepository.create(data);
        } catch (error: any) {
            throw new AppError(`Error creating KPI target: ${error.message}`, 500);
        }
    }

    static async update(id: string, data: any) {
        // Auto-score if actualValue provided
        if (data.actualValue !== undefined && data.targetValue !== undefined) {
            data.score = this.calculateScore(data.targetValue, data.actualValue, data.targetUnit || '');
        }

        try {
            const updated = await KpiRepository.update(id, data);
            if (!updated) throw new AppError('KPI target not found', 404);
            return updated;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error updating KPI target: ${error.message}`, 500);
        }
    }

    static async updateActualValue(id: string, actualValue: number) {
        const existing = await KpiRepository.findById(id);
        if (!existing) throw new AppError('KPI target not found', 404);

        const score = this.calculateScore(existing.targetValue, actualValue, existing.targetUnit || '');

        try {
            return await KpiRepository.updateActualValue(id, actualValue, score);
        } catch (error: any) {
            throw new AppError(`Error updating actual value: ${error.message}`, 500);
        }
    }

    static async delete(id: string) {
        try {
            const deleted = await KpiRepository.delete(id);
            if (!deleted) throw new AppError('KPI target not found', 404);
            return { message: 'KPI target deleted successfully' };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error deleting KPI target: ${error.message}`, 500);
        }
    }

    /**
     * Generate KPI suggestions from ABK (Workload Analysis) data
     * Uses activity library + workload data to create recommended KPI targets
     */
    static async generateFromAbk(employeeId: string, year: number, period: string) {
        try {
            // Get workload analysis
            const analysis = await WorkloadRepository.findAnalysisByEmployeeYear(employeeId, year);
            if (!analysis) {
                throw new AppError('Workload analysis not found for this employee/year. Please create ABK first.', 404);
            }

            const fullAnalysis = await WorkloadRepository.findAnalysisById(analysis.id);
            if (!fullAnalysis || !fullAnalysis.items || fullAnalysis.items.length === 0) {
                throw new AppError('No workload items found in ABK analysis', 404);
            }

            // Get activities from library for this position
            const libraryActivities = await ActivityLibraryRepository.findByPosition(fullAnalysis.position || '');

            // Generate KPI targets from ABK items
            const kpiTargets: any[] = [];
            const totalWeight = Math.floor(100 / Math.min(fullAnalysis.items.length, 5)); // Distribute weight

            // Take top items by totalMinutes (most significant work items)
            const topItems = [...fullAnalysis.items]
                .sort((a: any, b: any) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
                .slice(0, 5);

            for (let i = 0; i < topItems.length; i++) {
                const item = topItems[i];
                // Find matching library activity for standard duration
                const libraryMatch = libraryActivities.find(
                    (la: any) => la.activityName.toLowerCase().includes(item.activityName.toLowerCase().substring(0, 10))
                );

                const targetFrequency =
                    (item.freqDaily || 0) * 264 +
                    (item.freqWeekly || 0) * 52 +
                    (item.freqMonthly || 0) * 12 +
                    (item.freqQuarterly || 0) * 4 +
                    (item.freqSemester || 0) * 2 +
                    (item.freqYearly || 0);

                const kpi = await KpiRepository.create({
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
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error generating KPI from ABK: ${error.message}`, 500);
        }
    }
}
