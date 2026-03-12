import { KpiRepository } from './kpi.repository';
import { WorkloadRepository } from '../workload/workload.repository';
import { ActivityLibraryRepository } from '../activity-library/activity-library.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
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
                        (a: any) => (a.activityName || '').toLowerCase() === (cleanName || '').toLowerCase()
                    );

                    // If no exact match, try contains match
                    if (!match) {
                        match = allActivities.find(
                            (a: any) => (a.activityName || '').toLowerCase().includes((cleanName || '').toLowerCase())
                                || (cleanName || '').toLowerCase().includes((a.activityName || '').toLowerCase())
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

    /**
     * Rebalance KPI weights for an employee and period so the total is 100%.
     * Uses composition rules based on SOP_06_KINERJA.md for each department.
     */
    static async rebalanceWeights(employeeId: string, period: string) {
        try {
            const employee = await PegawaiRepository.findById(employeeId);
            if (!employee) throw new AppError('Employee not found', 404);

            const deptName = (employee.department || '').toLowerCase();

            // Default fallback composition
            let targetComp = { process: 40, outcome: 40, strategic: 20 };

            // Apply SOP_06_KINERJA.md composition mapping based on department/division
            if (deptName.includes('pemasaran') || deptName.includes('marketing')) {
                // A.1 Bagian Pemasaran (Marketing): Process 25% + Outcome 65% + Strategic 10%
                targetComp = { process: 25, outcome: 65, strategic: 10 };
            } else if (deptName.includes('penagihan') || deptName.includes('kolektor')) {
                // A.2 Bagian Penagihan Nasabah Kredit: Process 40% + Outcome 40% + Strategic 20%
                targetComp = { process: 40, outcome: 40, strategic: 20 };
            } else if (deptName.includes('pelaporan')) {
                // A.3 Bagian Pelaporan: Process 40% + Outcome 50% + Strategic 10%
                targetComp = { process: 40, outcome: 50, strategic: 10 };
            } else if (deptName.includes('account officer') || deptName.includes('kredit')) {
                // A.4 Bagian Account Officer (Kredit): Process 40% + Outcome 50% + Strategic 10%
                targetComp = { process: 40, outcome: 50, strategic: 10 };
            } else if (deptName.includes('operasional') || deptName.includes('teller')) {
                // A.5 Bagian Operasional & Teller: Process 60% + Outcome 40%
                targetComp = { process: 60, outcome: 40, strategic: 0 };
            } else if (deptName.includes('customer service') || deptName.includes('cs')) {
                // A.6 Bagian Customer Service: Process 50% + Outcome 50%
                targetComp = { process: 50, outcome: 50, strategic: 0 };
            } else if (deptName.includes('hrd') || deptName.includes('umum')) {
                // A.7 Bagian HRD & Umum: Process 40% + Outcome 50% + Strategic 10%
                targetComp = { process: 40, outcome: 50, strategic: 10 };
            } else if (deptName.includes('teknologi informasi') || deptName.includes('it') || deptName.includes('ti')) {
                // A.8 Bagian TI (Teknologi Informasi): Process 50% + Outcome 35% + Strategic 15%
                targetComp = { process: 50, outcome: 35, strategic: 15 };
            } else if (deptName.includes('akuntansi') || deptName.includes('keuangan')) {
                // A.9 Bagian Akuntansi & Keuangan: Process 50% + Outcome 50%
                targetComp = { process: 50, outcome: 50, strategic: 0 };
            } else if (deptName.includes('audit') || deptName.includes('skai')) {
                // A.10 Bagian Satuan Kerja Audit Internal (SKAI): Process 50% + Outcome 30% + Strategic 20%
                targetComp = { process: 50, outcome: 30, strategic: 20 };
            }

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
