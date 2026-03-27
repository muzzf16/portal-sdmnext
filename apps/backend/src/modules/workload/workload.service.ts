import { AppError } from '../../utils/errors';
import { WorkloadRepository } from './workload.repository';
import {
    SaveWorkloadAnalysisPayload,
    WorkloadAnalysis,
    WorkloadItem,
    WorkloadStatus,
} from './workload.types';

const DAYS_IN_YEAR = 264;
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;
const HOURS_PER_DAY = 8;
const AVAILABLE_YEARLY_MINUTES = DAYS_IN_YEAR * HOURS_PER_DAY * 60;
const VALID_STATUSES: WorkloadStatus[] = ['draft', 'submitted', 'approved', 'returned'];

const normalizeText = (value: unknown) => String(value ?? '').trim();

const normalizeNumber = (value: unknown, fieldName: string) => {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number) || number < 0) {
        throw new AppError(`${fieldName} harus berupa angka 0 atau lebih`, 400);
    }
    return number;
};

export default class WorkloadService {
    static calculateFTE(totalYearlyMinutes: number): {
        ftePercentage: number;
        fteStatus: 'Overload' | 'Normal' | 'Underload';
        hoursPerDay: number;
    } {
        const ftePercentage = parseFloat(((totalYearlyMinutes / AVAILABLE_YEARLY_MINUTES) * 100).toFixed(1));
        const hoursPerDay = parseFloat((totalYearlyMinutes / DAYS_IN_YEAR / 60).toFixed(2));

        let fteStatus: 'Overload' | 'Normal' | 'Underload';
        if (ftePercentage > 100) {
            fteStatus = 'Overload';
        } else if (ftePercentage >= 80) {
            fteStatus = 'Normal';
        } else {
            fteStatus = 'Underload';
        }

        return { ftePercentage, fteStatus, hoursPerDay };
    }

    static calculateTotalMinutes(item: WorkloadItem) {
        return item.durationMinutes * (
            item.freqDaily * DAYS_IN_YEAR +
            item.freqWeekly * WEEKS_IN_YEAR +
            item.freqMonthly * MONTHS_IN_YEAR +
            item.freqQuarterly * 4 +
            item.freqSemester * 2 +
            item.freqYearly
        );
    }

    private static normalizeItem(item: WorkloadItem): WorkloadItem {
        const normalizedItem: WorkloadItem = {
            id: normalizeText(item.id) || undefined,
            analysisId: normalizeText(item.analysisId) || undefined,
            activityId: normalizeText(item.activityId) || null,
            activityName: normalizeText(item.activityName),
            outputUnit: normalizeText(item.outputUnit),
            durationMinutes: normalizeNumber(item.durationMinutes, 'durationMinutes'),
            freqDaily: normalizeNumber(item.freqDaily, 'freqDaily'),
            freqWeekly: normalizeNumber(item.freqWeekly, 'freqWeekly'),
            freqMonthly: normalizeNumber(item.freqMonthly, 'freqMonthly'),
            freqQuarterly: normalizeNumber(item.freqQuarterly, 'freqQuarterly'),
            freqSemester: normalizeNumber(item.freqSemester, 'freqSemester'),
            freqYearly: normalizeNumber(item.freqYearly, 'freqYearly'),
            totalMinutes: 0,
        };

        if (!normalizedItem.activityName) {
            throw new AppError('activityName wajib diisi untuk setiap item ABK', 400);
        }

        normalizedItem.totalMinutes = this.calculateTotalMinutes(normalizedItem);
        return normalizedItem;
    }

    private static normalizePayload(payload: SaveWorkloadAnalysisPayload): SaveWorkloadAnalysisPayload {
        const normalizedStatus = (normalizeText(payload.status) || 'draft') as WorkloadStatus;
        if (!VALID_STATUSES.includes(normalizedStatus)) {
            throw new AppError(`status harus salah satu dari: ${VALID_STATUSES.join(', ')}`, 400);
        }

        const normalizedItems = Array.isArray(payload.items) ? payload.items.map((item) => this.normalizeItem(item)) : [];

        return {
            employeeId: normalizeText(payload.employeeId),
            year: normalizeNumber(payload.year, 'year'),
            position: normalizeText(payload.position),
            department: normalizeText(payload.department),
            status: normalizedStatus,
            items: normalizedItems,
        };
    }

    private static ensureTransition(currentStatus: WorkloadStatus, nextStatus: WorkloadStatus) {
        const allowedTransitions: Record<WorkloadStatus, WorkloadStatus[]> = {
            draft: ['submitted'],
            submitted: ['draft', 'approved', 'returned'],
            approved: ['returned'],
            returned: ['draft', 'submitted'],
        };

        if (!allowedTransitions[currentStatus].includes(nextStatus)) {
            throw new AppError(`Transisi status ABK tidak valid: ${currentStatus} -> ${nextStatus}`, 400);
        }
    }

    static async getAnalysis(employeeId: string, year: number): Promise<WorkloadAnalysis | null> {
        const normalizedEmployeeId = normalizeText(employeeId);
        if (!normalizedEmployeeId) {
            throw new AppError('employeeId is required', 400);
        }

        const normalizedYear = normalizeNumber(year, 'year');
        const header = await WorkloadRepository.findAnalysisByEmployeeYear(normalizedEmployeeId, normalizedYear);
        if (!header) return null;

        return WorkloadRepository.findAnalysisById(header.id);
    }

    static async getAnalysisById(id: string): Promise<WorkloadAnalysis> {
        const normalizedId = normalizeText(id);
        if (!normalizedId) {
            throw new AppError('analysis id is required', 400);
        }

        const analysis = await WorkloadRepository.findAnalysisById(normalizedId);
        if (!analysis) {
            throw new AppError('Workload analysis not found', 404);
        }

        return analysis;
    }

    static async saveAnalysis(payload: SaveWorkloadAnalysisPayload): Promise<WorkloadAnalysis> {
        const normalizedPayload = this.normalizePayload(payload);

        if (!normalizedPayload.employeeId) {
            throw new AppError('employeeId is required', 400);
        }

        if (!normalizedPayload.year) {
            throw new AppError('year is required', 400);
        }

        const totalYearlyMinutes = normalizedPayload.items.reduce(
            (sum, item) => sum + (item.totalMinutes || 0),
            0
        );

        let analysis = await WorkloadRepository.findAnalysisByEmployeeYear(
            normalizedPayload.employeeId,
            normalizedPayload.year
        );

        if (!analysis) {
            analysis = await WorkloadRepository.createAnalysis({
                ...normalizedPayload,
                totalYearlyMinutes,
                status: normalizedPayload.status || 'draft',
            });
        } else {
            if (
                normalizedPayload.status &&
                normalizedPayload.status !== analysis.status &&
                normalizedPayload.status !== 'draft'
            ) {
                this.ensureTransition(analysis.status, normalizedPayload.status);
            }

            analysis = await WorkloadRepository.updateAnalysisHeader(analysis.id, {
                position: normalizedPayload.position || analysis.position,
                department: normalizedPayload.department || analysis.department,
                totalYearlyMinutes,
                status: normalizedPayload.status || analysis.status,
            });
        }

        if (!analysis) {
            throw new AppError('Failed to save workload analysis', 500);
        }

        await WorkloadRepository.clearItems(analysis.id);
        for (const item of normalizedPayload.items) {
            await WorkloadRepository.createItem({ ...item, analysisId: analysis.id });
        }

        return this.getAnalysisById(analysis.id);
    }

    static async submitAnalysis(id: string): Promise<WorkloadAnalysis> {
        const analysis = await this.getAnalysisById(id);
        this.ensureTransition(analysis.status, 'submitted');

        const updated = await WorkloadRepository.updateAnalysisStatus(analysis.id, 'submitted');
        if (!updated) {
            throw new AppError('Failed to submit workload analysis', 500);
        }

        return updated;
    }

    static async approveAnalysis(id: string): Promise<WorkloadAnalysis> {
        const analysis = await this.getAnalysisById(id);
        this.ensureTransition(analysis.status, 'approved');

        const updated = await WorkloadRepository.updateAnalysisStatus(analysis.id, 'approved');
        if (!updated) {
            throw new AppError('Failed to approve workload analysis', 500);
        }

        return updated;
    }
}
