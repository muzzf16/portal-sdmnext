import { KpiRepository } from './kpi.repository';
import { WorkloadRepository } from '../workload/workload.repository';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';
import { AppError } from '../../utils/errors';
import { openDb } from '../../config/db';

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
            // Check if source is manual (default) and abkActivityId is missing
            if ((!data.source || data.source === 'manual') && !data.abkActivityId) {
                const db = await openDb();
                const cleanName = data.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
                let match = await db.get('SELECT id FROM activity_library WHERE LOWER(activityName) = LOWER(?) LIMIT 1', cleanName);

                if (!match) {
                    const activityId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const now = new Date().toISOString();
                    await db.run(
                        `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        activityId, 'Semua Jabatan', '', cleanName, 60, data.targetUnit === 'jumlah' ? 'Kali' : (data.targetUnit || 'Selesai'), 'Tugas Khusus KPI', now
                    );
                    data.abkActivityId = activityId;
                } else {
                    data.abkActivityId = match.id;
                }
            }

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
                const key = item.activityName.toLowerCase();
                if (!uniqueItemsMap.has(key) || (item.totalMinutes || 0) > (uniqueItemsMap.get(key).totalMinutes || 0)) {
                    uniqueItemsMap.set(key, item);
                }
            }
            const uniqueItems = Array.from(uniqueItemsMap.values());

            // Take top items by totalMinutes, skip those already in KPI
            const topItems = uniqueItems
                .sort((a: any, b: any) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
                .filter((item: any) => !existingNames.has(`penyelesaian ${item.activityName}`.toLowerCase()))
                .slice(0, 5);

            if (topItems.length === 0) {
                throw new AppError('Semua aktivitas ABK sudah ada di KPI untuk periode ini.', 400);
            }

            // Calculate available weight (remaining from 100%)
            const availableWeight = Math.max(0, 100 - existingTotalWeight);
            if (availableWeight <= 0) {
                throw new AppError('Total bobot KPI sudah mencapai 100%. Hapus atau kurangi bobot KPI yang ada terlebih dahulu.', 400);
            }

            const weightPerItem = Math.floor(availableWeight / topItems.length);
            const kpiTargets: any[] = [];

            for (let i = 0; i < topItems.length; i++) {
                const item = topItems[i];

                // Find matching activity from library
                let abkActivityId = item.activityId || null;
                if (!abkActivityId) {
                    const exactMatch = libraryActivities.find(
                        (la: any) => la.activityName.toLowerCase() === item.activityName.toLowerCase()
                    );
                    if (exactMatch) {
                        abkActivityId = exactMatch.id;
                    } else {
                        const fuzzyMatch = libraryActivities.find(
                            (la: any) => la.activityName.toLowerCase().includes(item.activityName.toLowerCase())
                                || item.activityName.toLowerCase().includes(la.activityName.toLowerCase())
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
                throw new AppError('Tidak ada KPI target untuk pegawai dan periode ini.', 400);
            }

            const db = await openDb();

            // Preload all activities from activity_library for name-based matching
            const allActivities = await db.all('SELECT id, activityName FROM activity_library');

            const results: any[] = [];

            for (const kpi of kpis) {
                let activityId = kpi.abkActivityId;

                // If abkActivityId is null, try to find matching activity by name
                if (!activityId) {
                    // KPI names are typically "Penyelesaian {activityName}"
                    const cleanName = kpi.kpiName
                        .replace(/^Penyelesaian\s+/i, '')
                        .trim();

                    // Try exact match first
                    let match = allActivities.find(
                        (a: any) => a.activityName.toLowerCase() === cleanName.toLowerCase()
                    );

                    // If no exact match, try contains match
                    if (!match) {
                        match = allActivities.find(
                            (a: any) => a.activityName.toLowerCase().includes(cleanName.toLowerCase())
                                || cleanName.toLowerCase().includes(a.activityName.toLowerCase())
                        );
                    }

                    if (match) {
                        activityId = match.id;
                        // Backfill the abkActivityId for future syncs
                        await db.run(
                            'UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?',
                            activityId, new Date().toISOString(), kpi.id
                        );
                    }
                }

                if (!activityId) {
                    // Auto-create missing activity library entry instead of skipping
                    const cleanName = kpi.kpiName.replace(/^Penyelesaian\s+/i, '').trim();
                    const newId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const now = new Date().toISOString();

                    await db.run(
                        `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        newId, 'Semua Jabatan', '', cleanName, 60, kpi.targetUnit === 'jumlah' ? 'Kali' : (kpi.targetUnit || 'Selesai'), 'Tugas Khusus KPI', now
                    );
                    activityId = newId;

                    // Backfill the newly created ID to the KPI target
                    await db.run(
                        'UPDATE kpi_targets SET abkActivityId = ?, updated_at = ? WHERE id = ?',
                        activityId, now, kpi.id
                    );
                }

                // Sum approved frekuensi from WLA logs matching this activity
                const row = await db.get(
                    `SELECT 
                        COALESCE(SUM(l.frekuensi), 0) as total_frekuensi,
                        COALESCE(SUM(l.total_durasi_terhitung), 0) as total_durasi,
                        COUNT(*) as jumlah_hari
                     FROM log_aktivitas_harian l
                     WHERE l.id_pegawai = ?
                       AND l.id_activity_library = ?
                       AND l.tanggal >= ? AND l.tanggal <= ?
                       AND (l.status_approval IS NULL OR l.status_approval != 'rejected')`,
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
}
