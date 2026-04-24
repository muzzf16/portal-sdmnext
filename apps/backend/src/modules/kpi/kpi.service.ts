import { KpiRepository } from './kpi.repository';
import { WorkloadRepository } from '../workload/workload.repository';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import JabatanService from '../jabatan/jabatan.service';
import { AppError } from '../../utils/errors';
import { openDb } from '../../config/db';
import {
    CreateKpiPayload,
    KpiCategory,
    KpiFilters,
    KpiSummaryEmployee,
    KpiSummaryFilters,
    KpiSummaryRecord,
    KpiSummaryRow,
    KpiSummaryStatus,
    KpiTarget,
    KpiSyncResultDetail,
    UpdateKpiPayload,
} from './kpi.types';

export default class KpiService {
    private static normalizeText(value: unknown) {
        return String(value ?? '').trim();
    }

    private static normalizeNumber(value: unknown, fieldName: string) {
        const number = Number(value ?? 0);
        if (!Number.isFinite(number) || number < 0) {
            throw new AppError(`${fieldName} harus berupa angka 0 atau lebih`, 400);
        }
        return number;
    }

    private static normalizeCategory(value: unknown): KpiCategory {
        const category = this.normalizeText(value).toLowerCase();
        if (category === 'strategic' || category === 'outcome') {
            return category;
        }
        return 'process';
    }

    private static buildSummaryRows(employees: KpiSummaryEmployee[], records: KpiSummaryRecord[]): KpiSummaryRow[] {
        const grouped = new Map<string, {
            employeeId: string;
            employeeName: string;
            nip: string;
            department: string;
            position: string;
            totalKpi: number;
            totalWeight: number;
            weightedScoreAccumulator: number;
            draftCount: number;
            waitingApprovalCount: number;
            activeCount: number;
            completedCount: number;
        }>();

        for (const employee of employees) {
            grouped.set(String(employee.employeeId), {
                employeeId: String(employee.employeeId),
                employeeName: employee.employeeName || '',
                nip: employee.nip || '',
                department: employee.department || '',
                position: employee.position || '',
                totalKpi: 0,
                totalWeight: 0,
                weightedScoreAccumulator: 0,
                draftCount: 0,
                waitingApprovalCount: 0,
                activeCount: 0,
                completedCount: 0,
            });
        }

        for (const row of records) {
            const employeeId = String(row.employeeId);
            const weight = Number(row.weight || 0);
            const score = Number(row.score || 0);

            if (!grouped.has(employeeId)) {
                grouped.set(employeeId, {
                    employeeId,
                    employeeName: row.employeeName || '',
                    nip: row.nip || '',
                    department: row.department || '',
                    position: row.position || '',
                    totalKpi: 0,
                    totalWeight: 0,
                    weightedScoreAccumulator: 0,
                    draftCount: 0,
                    waitingApprovalCount: 0,
                    activeCount: 0,
                    completedCount: 0,
                });
            }

            const current = grouped.get(employeeId)!;
            current.totalKpi += 1;
            current.totalWeight += weight;
            current.weightedScoreAccumulator += score * weight;

            if (row.status === 'draft') current.draftCount += 1;
            else if (row.status === 'waiting_approval') current.waitingApprovalCount += 1;
            else if (row.status === 'active') current.activeCount += 1;
            else if (row.status === 'completed') current.completedCount += 1;
        }

        return Array.from(grouped.values())
            .map((row) => {
                let statusSummary: KpiSummaryStatus = 'active';

                if (row.totalKpi === 0) {
                    statusSummary = 'empty';
                } else if (row.completedCount === row.totalKpi) {
                    statusSummary = 'completed';
                } else if (row.waitingApprovalCount > 0) {
                    statusSummary = 'waiting_approval';
                } else if (row.draftCount > 0) {
                    statusSummary = 'draft';
                }

                return {
                    employeeId: row.employeeId,
                    employeeName: row.employeeName,
                    nip: row.nip,
                    department: row.department,
                    position: row.position,
                    totalKpi: row.totalKpi,
                    totalWeight: row.totalWeight,
                    weightedScore: row.totalWeight > 0 ? row.weightedScoreAccumulator / row.totalWeight : 0,
                    draftCount: row.draftCount,
                    waitingApprovalCount: row.waitingApprovalCount,
                    activeCount: row.activeCount,
                    completedCount: row.completedCount,
                    statusSummary,
                };
            })
            .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }

    private static async ensureActivityLibraryLink(kpi: KpiTarget) {
        const db = await openDb();
        const allActivities = await db.all('SELECT id, activityName FROM activity_library') as Array<{ id: string; activityName: string }>;

        let activityId = kpi.abkActivityId || null;

        if (!activityId) {
            const cleanName = kpi.kpiName.replace(/^Penyelesaian\s+/i, '').trim();

            let match = allActivities.find(
                (activity) => (activity.activityName || '').toLowerCase() === cleanName.toLowerCase()
            );

            if (!match) {
                match = allActivities.find(
                    (activity) => (activity.activityName || '').toLowerCase().includes(cleanName.toLowerCase())
                        || cleanName.toLowerCase().includes((activity.activityName || '').toLowerCase())
                );
            }

            if (match) {
                activityId = match.id;
                await db.run(
                    'UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?',
                    activityId, new Date().toISOString(), kpi.id
                );
            }
        }

        if (!activityId) {
            const cleanName = kpi.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
            const newId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            await db.run(
                `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                newId,
                'Semua Jabatan',
                '',
                cleanName,
                60,
                kpi.targetUnit === 'jumlah' ? 'Kali' : (kpi.targetUnit || 'Selesai'),
                'Tugas Khusus KPI',
                now
            );
            activityId = newId;

            await db.run(
                'UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?',
                activityId, now, kpi.id
            );
        }

        return activityId;
    }

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

    static async getAll(filters?: KpiFilters) {
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

    static async getSummary(filters: KpiSummaryFilters, supervisorId?: string) {
        const hasPeriod = Boolean(filters.period);
        const hasDateRange = Boolean(filters.startDate && filters.endDate);

        if (!hasPeriod && !hasDateRange) {
            throw new AppError('period or startDate/endDate is required', 400);
        }

        try {
            let allowedEmployeeIds: string[] | undefined;

            if (supervisorId) {
                const subordinates = await JabatanService.getAllSubordinates(supervisorId);
                allowedEmployeeIds = subordinates.map((employee: any) => String(employee.id));

                if (allowedEmployeeIds.length === 0) {
                    return [];
                }

                if (filters.employeeId && !allowedEmployeeIds.includes(filters.employeeId)) {
                    return [];
                }
            }

            const employees = await KpiRepository.findSummaryEmployees({
                employeeId: filters.employeeId,
                employeeIds: allowedEmployeeIds,
            });

            const rows = await KpiRepository.findSummaryRecords({
                employeeId: filters.employeeId,
                employeeIds: allowedEmployeeIds,
                period: filters.period,
            });

            const filteredRows = hasDateRange
                ? rows.filter((row) => this.periodOverlapsDateRange(row.period, filters.startDate!, filters.endDate!))
                : rows;

            return this.buildSummaryRows(employees, filteredRows);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error retrieving KPI summary: ${error.message}`, 500);
        }
    }

    static async getMonitoringSummaryData(filters: KpiSummaryFilters, supervisorId?: string) {
        const hasPeriod = Boolean(filters.period);
        const hasDateRange = Boolean(filters.startDate && filters.endDate);

        if (!hasPeriod && !hasDateRange) {
            throw new AppError('period or startDate/endDate is required', 400);
        }

        try {
            let allowedEmployeeIds: string[] | undefined;

            if (supervisorId) {
                const subordinates = await JabatanService.getAllSubordinates(supervisorId);
                allowedEmployeeIds = subordinates.map((employee: any) => String(employee.id));

                if (allowedEmployeeIds.length === 0) {
                    return [];
                }

                if (filters.employeeId && !allowedEmployeeIds.includes(filters.employeeId)) {
                    return [];
                }
            }

            const employees = await KpiRepository.findSummaryEmployees({
                employeeId: filters.employeeId,
                employeeIds: allowedEmployeeIds,
            });

            if (employees.length === 0) return [];
            const empIds = employees.map(e => e.employeeId);

            const db = await openDb();
            const placeholders = empIds.map(() => '?').join(',');

            // fetch all KPIs
            let kpiQuery = `SELECT * FROM kpi_targets WHERE employeeId IN (${placeholders})`;
            let kpiParams = [...empIds];

            if (filters.period) {
                kpiQuery += ` AND period = ?`;
                kpiParams.push(filters.period);
            }

            let kpis = await db.all(kpiQuery, ...kpiParams) as any[];

            if (!filters.period && hasDateRange) {
                kpis = kpis.filter(k => this.periodOverlapsDateRange(k.period, filters.startDate!, filters.endDate!));
            }

            // fetch all approved WLA logs
            const logs = await db.all(
                `SELECT l.id_pegawai, l.nominal_rupiah, l.total_durasi_terhitung, l.id_activity_library, a.activityName
                 FROM log_aktivitas_harian l
                 LEFT JOIN activity_library a ON l.id_activity_library = a.id
                 WHERE l.tanggal >= ? AND l.tanggal <= ? AND l.status_approval = 'approved'
                 AND l.id_pegawai IN (${placeholders})`,
                filters.startDate, filters.endDate, ...empIds
            ) as any[];

            return employees.map(emp => {
                const empKpis = kpis.filter(k => String(k.employeeId) === String(emp.employeeId));
                const empLogs = logs.filter(l => String(l.id_pegawai) === String(emp.employeeId));

                const totalDurasiMenit = empLogs.reduce((sum, log) => sum + (Number(log.total_durasi_terhitung) || 0), 0);

                const isNPL = (name: string) => name.toLowerCase().includes('npl');
                const isKredit = (name: string) => name.toLowerCase().includes('pemasaran kredit');
                const isDana = (name: string) => name.toLowerCase().includes('pemasaran dana');

                const nplLogs = empLogs.filter(l => isNPL(l.activityName || ''));
                const kreditLogs = empLogs.filter(l => isKredit(l.activityName || ''));
                const danaLogs = empLogs.filter(l => isDana(l.activityName || ''));

                const nplActual = nplLogs.reduce((sum, l) => sum + (Number(l.nominal_rupiah) || 0), 0);
                const kreditActual = kreditLogs.reduce((sum, l) => sum + (Number(l.nominal_rupiah) || 0), 0);
                const danaActual = danaLogs.reduce((sum, l) => sum + (Number(l.nominal_rupiah) || 0), 0);

                const nplTargets = empKpis.filter(k => isNPL(k.kpiName || ''));
                const kreditTargets = empKpis.filter(k => isKredit(k.kpiName || ''));
                const danaTargets = empKpis.filter(k => isDana(k.kpiName || ''));

                const nplTarget = nplTargets.reduce((sum, k) => sum + (Number(k.targetValue) || 0), 0);
                const kreditTarget = kreditTargets.reduce((sum, k) => sum + (Number(k.targetValue) || 0), 0);
                const danaTarget = danaTargets.reduce((sum, k) => sum + (Number(k.targetValue) || 0), 0);

                return {
                    employeeId: emp.employeeId,
                    employeeName: emp.employeeName,
                    nip: emp.nip,
                    department: emp.department,
                    position: emp.position,
                    totalDurasiMenit,
                    khusus: {
                        nplTarget, nplActual, nplCount: nplTargets.length,
                        kreditTarget, kreditActual, kreditCount: kreditTargets.length,
                        danaTarget, danaActual, danaCount: danaTargets.length
                    }
                };
            });
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error retrieving monitoring summary: ${error.message}`, 500);
        }
    }

    static async getById(id: string) {
        const item = await KpiRepository.findById(id);
        if (!item) throw new AppError('KPI target not found', 404);
        return item;
    }

    static async create(data: CreateKpiPayload) {
        const payload: CreateKpiPayload = {
            ...data,
            employeeId: this.normalizeText(data.employeeId),
            period: this.normalizeText(data.period),
            kpiName: this.normalizeText(data.kpiName),
            targetValue: this.normalizeNumber(data.targetValue, 'targetValue'),
            targetUnit: this.normalizeText(data.targetUnit) || '%',
            weight: this.normalizeNumber(data.weight, 'weight'),
            actualValue: this.normalizeNumber(data.actualValue, 'actualValue'),
            status: data.status || 'active',
            source: data.source || 'manual',
            category: this.normalizeCategory(data.category),
            notes: this.normalizeText(data.notes),
            abkActivityId: this.normalizeText(data.abkActivityId) || null,
            score: Number(data.score || 0),
        };

        if (!payload.employeeId || !payload.kpiName || !payload.period) {
            throw new AppError('employeeId, kpiName, and period are required', 400);
        }

        // Auto-score if actualValue provided
        if (payload.actualValue && payload.targetValue) {
            payload.score = this.calculateScore(payload.targetValue, payload.actualValue, payload.targetUnit || '');
        }

        try {
            // Check if source is manual (default) and abkActivityId is missing
            if ((!payload.source || payload.source === 'manual') && !payload.abkActivityId) {
                const db = await openDb();
                const cleanName = payload.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
                let match = await db.get('SELECT id FROM activity_library WHERE LOWER(activityName) = LOWER(?) LIMIT 1', cleanName);

                if (!match) {
                    const activityId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const now = new Date().toISOString();
                    await db.run(
                        `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        activityId, 'Semua Jabatan', '', cleanName, 60, payload.targetUnit === 'jumlah' ? 'Kali' : (payload.targetUnit || 'Selesai'), 'Tugas Khusus KPI', now
                    );
                    payload.abkActivityId = activityId;
                } else {
                    payload.abkActivityId = match.id;
                }
            }

            return await KpiRepository.create(payload);
        } catch (error: any) {
            throw new AppError(`Error creating KPI target: ${error.message}`, 500);
        }
    }

    static async update(id: string, data: UpdateKpiPayload) {
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

    static async updateActualValue(id: string, actualValue: number, evidenceUrl?: string) {
        const existing = await KpiRepository.findById(id);
        if (!existing) throw new AppError('KPI target not found', 404);

        const score = this.calculateScore(existing.targetValue, actualValue, existing.targetUnit || '');

        try {
            return await KpiRepository.updateActualValue(id, actualValue, score, evidenceUrl);
        } catch (error: any) {
            throw new AppError(`Error updating actual value: ${error.message}`, 500);
        }
    }

    static async updateEvidence(id: string, evidenceUrl: string) {
        const existing = await KpiRepository.findById(id);
        if (!existing) throw new AppError('KPI target not found', 404);
        try {
            return await KpiRepository.updateEvidence(id, evidenceUrl);
        } catch (error: any) {
            throw new AppError(`Error updating evidence: ${error.message}`, 500);
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

            // Get existing KPIs for this employee+period to avoid duplicates
            const existingKpis = await KpiRepository.findByEmployeePeriod(employeeId, period);
            const existingNames = new Set(existingKpis.map((k: any) => k.kpiName.toLowerCase()));
            const existingTotalWeight = existingKpis.reduce((sum: number, k: any) => sum + (k.weight || 0), 0);

            // Get activities from library for this position
            const libraryActivities = await ActivityLibraryRepository.findByPosition(fullAnalysis.position || '');

            // Deduplicate ABK items by activityName (keep the one with highest totalMinutes)
            const uniqueItemsMap = new Map<string, any>();
            for (const item of fullAnalysis.items) {
                const key = (item.activityName || '').toLowerCase();
                if (!uniqueItemsMap.has(key) || (item.totalMinutes || 0) > (uniqueItemsMap.get(key).totalMinutes || 0)) {
                    uniqueItemsMap.set(key, item);
                }
            }
            const uniqueItems = Array.from(uniqueItemsMap.values());

            // Take top items by totalMinutes, skip those already in KPI
            const topItems = uniqueItems
                .sort((a: any, b: any) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
                .filter((item: any) => !existingNames.has(`penyelesaian ${(item.activityName || '')}`.toLowerCase()));

            if (topItems.length === 0) {
                return { _isBusinessError: true, message: 'Semua aktivitas ABK sudah ada di KPI untuk periode ini.' };
            }

            // Calculate available weight (remaining from 100%)
            const availableWeight = Math.max(0, 100 - existingTotalWeight);
            if (availableWeight <= 0) {
                return { _isBusinessError: true, message: 'Total bobot KPI sudah mencapai 100%. Hapus atau kurangi bobot KPI yang ada terlebih dahulu.' };
            }

            const weightPerItem = Math.floor(availableWeight / topItems.length);
            const kpiTargets: any[] = [];

            for (let i = 0; i < topItems.length; i++) {
                const item = topItems[i];

                // Find matching activity from library
                let abkActivityId = item.activityId || null;
                if (!abkActivityId) {
                    const exactMatch = libraryActivities.find(
                        (la: any) => (la.activityName || '').toLowerCase() === (item.activityName || '').toLowerCase()
                    );
                    if (exactMatch) {
                        abkActivityId = exactMatch.id;
                    } else {
                        const fuzzyMatch = libraryActivities.find(
                            (la: any) => (la.activityName || '').toLowerCase().includes((item.activityName || '').toLowerCase())
                                || (item.activityName || '').toLowerCase().includes((la.activityName || '').toLowerCase())
                        );
                        abkActivityId = fuzzyMatch?.id || null;
                    }
                }

                let periodFactor = 1;
                if (period.match(/-S[12]$/i)) periodFactor = 0.5;
                else if (period.match(/-Q[1-4]$/i)) periodFactor = 0.25;
                else if (period.match(/-\d{2}$/)) periodFactor = 1 / 12;

                const annualFrequency =
                    (item.freqDaily || 0) * 264 +
                    (item.freqWeekly || 0) * 52 +
                    (item.freqMonthly || 0) * 12 +
                    (item.freqQuarterly || 0) * 4 +
                    (item.freqSemester || 0) * 2 +
                    (item.freqYearly || 0);

                const targetFrequency = Math.ceil(annualFrequency * periodFactor);

                // Last item gets the remainder to ensure total = exactly availableWeight
                const weight = i === topItems.length - 1
                    ? (availableWeight - weightPerItem * (topItems.length - 1))
                    : weightPerItem;

                const kpi = await KpiRepository.create({
                    employeeId,
                    period,
                    kpiName: `Penyelesaian ${item.activityName}`,
                    targetValue: targetFrequency,
                    targetUnit: 'jumlah',
                    weight,
                    status: 'active',
                    source: 'abk',
                    category: 'process',  // ABK-generated KPIs are always process KPIs
                    abkActivityId: abkActivityId,
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

    /**
     * Sync realisasi (actualValue) for KPI targets from WLA daily logs.
     * For each KPI, find the matching activity in activity_library 
     * (via abkActivityId or by name matching), then sum approved WLA log
     * frekuensi within the period date range.
     */
    static async syncRealisasiFromWla(employeeId: string, period: string) {
        try {
            const { startDate, endDate } = this.parsePeriodToDateRange(period);

            const kpis = await KpiRepository.findByEmployeePeriod(employeeId, period);
            if (kpis.length === 0) {
                return {
                    synced: 0,
                    skipped: 0,
                    period,
                    startDate,
                    endDate,
                    details: []
                };
            }

            const db = await openDb();
            const results: KpiSyncResultDetail[] = [];

            for (const kpi of kpis) {
                const activityId = await this.ensureActivityLibraryLink(kpi);

                // Only approved WLA logs count as official KPI actuals.
                const row = await db.get(
                    `SELECT 
                        COALESCE(SUM(l.frekuensi), 0) as total_frekuensi,
                        COALESCE(SUM(l.total_durasi_terhitung), 0) as total_durasi,
                        COUNT(*) as jumlah_hari
                     FROM log_aktivitas_harian l
                     WHERE l.id_pegawai = ?
                       AND l.id_activity_library = ?
                       AND l.tanggal >= ? AND l.tanggal <= ?
                       AND l.status_approval = 'approved'`,
                    employeeId, activityId, startDate, endDate
                );

                const actualValue = row?.total_frekuensi || 0;
                const score = this.calculateScore(kpi.targetValue, actualValue, kpi.targetUnit || '');

                await KpiRepository.updateActualValue(kpi.id, actualValue, score);
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

            const synced = results.filter((r: any) => !r.skipped).length;
            const skipped = results.filter((r: any) => r.skipped).length;

            return {
                synced,
                skipped,
                period,
                startDate,
                endDate,
                details: results
            };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error syncing realisasi from WLA: ${error.message}`, 500);
        }
    }

    /**
     * Parse period string (e.g. '2026-S1', '2026-S2', '2026-Q1', '2026') to date range
     */
    private static parsePeriodToDateRange(period: string): { startDate: string; endDate: string } {
        // Format: YYYY-S1 (Jan-Jun), YYYY-S2 (Jul-Dec)
        const semesterMatch = period.match(/^(\d{4})-S([12])$/i);
        if (semesterMatch) {
            const year = semesterMatch[1];
            if (semesterMatch[2] === '1') {
                return { startDate: `${year}-01-01`, endDate: `${year}-06-30` };
            } else {
                return { startDate: `${year}-07-01`, endDate: `${year}-12-31` };
            }
        }

        // Format: YYYY-Q1..Q4
        const quarterMatch = period.match(/^(\d{4})-Q([1-4])$/i);
        if (quarterMatch) {
            const year = quarterMatch[1];
            const q = parseInt(quarterMatch[2]);
            const startMonth = String((q - 1) * 3 + 1).padStart(2, '0');
            const endMonth = String(q * 3).padStart(2, '0');
            const lastDay = new Date(parseInt(year), q * 3, 0).getDate();
            return { startDate: `${year}-${startMonth}-01`, endDate: `${year}-${endMonth}-${lastDay}` };
        }

        // Format: YYYY-MM
        const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
        if (monthMatch) {
            const year = monthMatch[1];
            const month = monthMatch[2];
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
            return { startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${lastDay}` };
        }

        // Fallback: full year
        const yearMatch = period.match(/^(\d{4})/);
        const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
        return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }

    private static periodOverlapsDateRange(period: string, filterStartDate: string, filterEndDate: string) {
        const { startDate, endDate } = this.parsePeriodToDateRange(period);
        return startDate <= filterEndDate && endDate >= filterStartDate;
    }

    private static getTargetComposition(department: string) {
        const deptName = (department || '').toLowerCase();

        if (deptName.includes('pemasaran') || deptName.includes('marketing')) {
            return { process: 25, outcome: 65, strategic: 10 };
        }
        if (deptName.includes('penagihan') || deptName.includes('kolektor')) {
            return { process: 40, outcome: 40, strategic: 20 };
        }
        if (deptName.includes('pelaporan')) {
            return { process: 40, outcome: 50, strategic: 10 };
        }
        if (deptName.includes('account officer') || deptName.includes('kredit')) {
            return { process: 40, outcome: 50, strategic: 10 };
        }
        if (deptName.includes('operasional') || deptName.includes('teller')) {
            return { process: 60, outcome: 40, strategic: 0 };
        }
        if (deptName.includes('customer service') || deptName.includes('cs')) {
            return { process: 50, outcome: 50, strategic: 0 };
        }
        if (deptName.includes('hrd') || deptName.includes('umum')) {
            return { process: 40, outcome: 50, strategic: 10 };
        }
        if (deptName.includes('teknologi informasi') || deptName.includes('it') || deptName.includes('ti')) {
            return { process: 50, outcome: 35, strategic: 15 };
        }
        if (deptName.includes('akuntansi') || deptName.includes('keuangan')) {
            return { process: 50, outcome: 50, strategic: 0 };
        }
        if (deptName.includes('audit') || deptName.includes('skai')) {
            return { process: 50, outcome: 30, strategic: 20 };
        }

        return { process: 40, outcome: 40, strategic: 20 };
    }

    /**
     * Rebalance KPI weights for an employee and period so the total is 100%.
     * Uses composition rules based on SOP_06_KINERJA.md for each department.
     */
    static async rebalanceWeights(employeeId: string, period: string) {
        try {
            const employee = await PegawaiRepository.findById(employeeId);
            if (!employee) throw new AppError('Employee not found', 404);
            const targetComp = this.getTargetComposition(employee.department || '');

            const kpis = await KpiRepository.findByEmployeePeriod(employeeId, period);
            if (!kpis || kpis.length === 0) {
                return { success: true, message: 'Tidak ada KPI untuk direbalance.' };
            }

            // Group KPIs by category
            const kpisByCategory: Record<string, any[]> = {
                process: [],
                outcome: [],
                strategic: []
            };

            for (const kpi of kpis) {
                let cat = (kpi.category || 'process').toLowerCase().trim();
                // Map localized or UI strings to standard English keys
                if (cat.includes('proses')) cat = 'process';
                if (cat.includes('outcome') || cat.includes('hasil')) cat = 'outcome';
                if (cat.includes('strategic') || cat.includes('strategis')) cat = 'strategic';

                if (kpisByCategory[cat]) {
                    kpisByCategory[cat].push(kpi);
                } else {
                    // fallback to process if unknown
                    kpisByCategory.process.push(kpi);
                }
            }

            // Check missing categories based on target comp
            const missingRequired = [];
            const targetEntries = Object.entries(targetComp);
            for (const [cat, targetPct] of targetEntries) {
                if (targetPct > 0 && kpisByCategory[cat].length === 0) {
                    missingRequired.push(cat);
                }
            }

            if (missingRequired.length > 0) {
                // We no longer block this. Instead we let the algorithm redistribute the missing weight 
                // to the existing categories, and append a warning to the success message.
            }

            // Step 1: Detect missing categories and redistribute their weight to active categories
            let activeCategories = [];
            let missingTargetPct = 0;
            const currentTargets = { ...targetComp } as Record<string, number>;

            for (const [cat, targetPct] of targetEntries) {
                if (kpisByCategory[cat].length === 0) {
                    missingTargetPct += targetPct;
                    currentTargets[cat] = 0;
                } else {
                    activeCategories.push(cat);
                }
            }

            // If some categories are missing but there are active ones, distribute the missing % to the active ones proportionally
            if (missingTargetPct > 0 && activeCategories.length > 0) {
                const totalActiveTarget = activeCategories.reduce((sum, cat) => sum + currentTargets[cat], 0);
                if (totalActiveTarget > 0) {
                     let remainingRedistribute = missingTargetPct;
                     for (let i = 0; i < activeCategories.length; i++) {
                         const cat = activeCategories[i];
                         if (i === activeCategories.length - 1) {
                             currentTargets[cat] += remainingRedistribute;
                         } else {
                             const extra = Math.round((currentTargets[cat] / totalActiveTarget) * missingTargetPct);
                             currentTargets[cat] += extra;
                             remainingRedistribute -= extra;
                         }
                     }
                }
            }

            // Redistribute logic
            const updates = [];
            for (const cat of activeCategories) {
                const targetPct = currentTargets[cat];
                const catKpis = kpisByCategory[cat];
                
                // Give each KPI in this category a proportional share of the targetPct
                const currentCatTotalWeight = catKpis.reduce((sum: number, k: any) => sum + (Number(k.weight) || 0), 0);
                let remainingPct = Number(targetPct);
                
                for (let i = 0; i < catKpis.length; i++) {
                    const kpi = catKpis[i];
                    let newWeight = 0;

                    if (i === catKpis.length - 1) {
                        // Last item gets the exact remaining to handle rounding (ensures total hits targetPct)
                        newWeight = remainingPct;
                    } else {
                        if (currentCatTotalWeight === 0) {
                             newWeight = Math.floor(targetPct / catKpis.length);
                        } else {
                             // Proportional based on current weight
                             const currentKpiWeight = Number(kpi.weight) || 0;
                             newWeight = Math.round((currentKpiWeight / currentCatTotalWeight) * targetPct);
                        }
                        
                        // Prevent remainingPct from dropping below what is needed for at least 1% for remaining items
                        if (newWeight <= 0) newWeight = 1;
                        
                        // Ensure we don't consume more than available
                        const maxAllowed = remainingPct - (catKpis.length - 1 - i); // reserve 1 for each remaining
                        if (newWeight > maxAllowed && maxAllowed > 0) {
                            newWeight = maxAllowed;
                        }

                        remainingPct -= newWeight;
                    }

                    updates.push({ id: kpi.id, newWeight });
                }
            }

            // Perform DB updates
            const db = await openDb();
            for (const item of updates) {
                await db.run('UPDATE kpi_targets SET weight = ?, updated_at = ? WHERE id = ?', 
                    item.newWeight, new Date().toISOString(), item.id);
            }

            let msg = `Bobot KPI berhasil disesuaikan menjadi 100% mengikuti standar komposisi SOP departemen ${employee.department}.`;
            if (missingRequired.length > 0) {
                const catNames = missingRequired.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
                msg += ` Catatan: Anda belum memiliki target untuk kategori ${catNames}, sehingga bobotnya didistribusikan sementara ke kategori lain.`;
            }

            return {
                success: true,
                message: msg,
                details: updates
            };

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error rebalancing weights: ${error.message}`, 500);
        }
    }
}
