import React, { useMemo } from 'react';
import { KpiTarget } from '../types';
import { useAdminWlaDetailLogs, useDirectorNames, useNominalTargets } from '../hooks/usePerformanceManagementQuery';
import { Printer } from 'lucide-react';
import clsx from 'clsx';
import { formatKpiValue } from '../utils/formatters';

interface KpiMonitoringViewProps {
    isActive: boolean;
    kpis: KpiTarget[];
    period: string;
    role: string;
    employees: any[];
    selectedEmployee: string;
    setSelectedEmployee: (val: string) => void;
    periodOptions: any[];
    selectedPeriod: string;
    setSelectedPeriod: (val: string) => void;
}

// Helper to parse the selectedPeriod into a date range
const getPeriodDates = (p: string) => {
    if (!p) return { startDate: undefined, endDate: undefined };
    const sem = p.match(/^(\d{4})-S([12])$/i);
    if (sem) {
        return sem[2] === '1'
            ? { startDate: `${sem[1]}-01-01`, endDate: `${sem[1]}-06-30` }
            : { startDate: `${sem[1]}-07-01`, endDate: `${sem[1]}-12-31` };
    }
    const q = p.match(/^(\d{4})-Q([1-4])$/i);
    if (q) {
        const mStart = String((parseInt(q[2]) - 1) * 3 + 1).padStart(2, '0');
        const mEnd = String(parseInt(q[2]) * 3).padStart(2, '0');
        const lastDay = new Date(parseInt(q[1]), parseInt(q[2]) * 3, 0).getDate();
        return { startDate: `${q[1]}-${mStart}-01`, endDate: `${q[1]}-${mEnd}-${lastDay}` };
    }
    const m = p.match(/^(\d{4})-(\d{2})$/);
    if (m) {
        const lastDay = new Date(parseInt(m[1]), parseInt(m[2]), 0).getDate();
        return { startDate: `${m[1]}-${m[2]}-01`, endDate: `${m[1]}-${m[2]}-${lastDay}` };
    }
    const y = p.match(/^(\d{4})$/);
    if (y) return { startDate: `${y[1]}-01-01`, endDate: `${y[1]}-12-31` };
    return { startDate: undefined, endDate: undefined };
};

const EFFECTIVE_WORKING_MINUTES = 480;

// Helper to calculate total working days (Mon-Fri) between two dates
const getWorkingDays = (start: string, end: string) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    let count = 0;
    let curDate = new Date(startDateObj.getTime());
    while (curDate <= endDateObj) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count > 0 ? count : 1;
};

const getFteStatus = (percentage: number) => {
    if (percentage > 100) return { label: 'Overload', color: 'text-red-600' };
    if (percentage >= 80) return { label: 'Optimal', color: 'text-green-600' };
    return { label: 'Underload', color: 'text-yellow-600' };
};

const getScoreCategory = (score: number) => {
    if (score > 95) return { label: 'ISTIMEWA', className: 'bg-indigo-600 text-white shadow-sm border-indigo-700' };
    if (score > 85) return { label: 'SANGAT BAIK', className: 'bg-green-600 text-white shadow-sm border-green-700' };
    if (score > 75) return { label: 'BAIK', className: 'bg-blue-600 text-white shadow-sm border-blue-700' };
    if (score >= 65) return { label: 'CUKUP BAIK', className: 'bg-yellow-500 text-white shadow-sm border-yellow-600' };
    return { label: 'KURANG BAIK', className: 'bg-red-600 text-white shadow-sm border-red-700' };
};

const KpiMonitoringView: React.FC<KpiMonitoringViewProps> = ({ 
    isActive, 
    kpis, 
    role,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    periodOptions,
    selectedPeriod,
    setSelectedPeriod
}) => {
    // Fetch Director Names
    const { data: directors } = useDirectorNames();

    // Fetch WLA logs specifically for the selected employee and period
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    const { data: wlaLogs = [] } = useAdminWlaDetailLogs(selectedEmployee, startDate, endDate);

    // Fetch per-employee nominal targets
    const { data: nominalTargets } = useNominalTargets(selectedEmployee || undefined);
    const empNplTarget = nominalTargets?.npl ?? 50000000;
    const empKreditTarget = nominalTargets?.kredit ?? 100000000;
    const empDanaTarget = nominalTargets?.dana ?? 100000000;

    const selectedEmployeeName = useMemo(() => {
        const emp = employees.find(e => e.id === selectedEmployee);
        return emp ? `${emp.name} (${emp.nip})` : (selectedEmployee || '-');
    }, [employees, selectedEmployee]);

    const selectedPeriodLabel = useMemo(() => {
        const opt = periodOptions.find(o => o.value === selectedPeriod);
        return opt ? opt.label : (selectedPeriod || 'Semua Periode');
    }, [periodOptions, selectedPeriod]);

    const formatNominal = (val: number) => formatKpiValue(val, 'Rp');

    if (!isActive) return null;

    const summary = useMemo(() => {
        const isNominal = (name: string = '', unit: string = '') => {
            const n = name.toLowerCase();
            const u = (unit || '').toLowerCase();
            return n.includes('npl') || n.includes('pemasaran kredit') || n.includes('pemasaran dana') || u.includes('rp') || u.includes('nominal') || u.includes('rupiah');
        };
        
        const isKpiKhusus = (k: KpiTarget) => {
            return k.category === 'outcome' || k.category === 'strategic' || isNominal(k.kpiName);
        };

        const baseKhususKpiList = kpis.filter(isKpiKhusus);
        
        // Injek default nominal jika belum ada (NPL, Kredit, Dana)
        const nominalTypes = [
            { name: 'Penanganan NPL', key: 'npl', default: 50000000 },
            { name: 'Pemasaran Kredit', key: 'kredit', default: 100000000 },
            { name: 'Pemasaran Dana', key: 'dana', default: 100000000 }
        ];

        const khususKpiList = [...baseKhususKpiList];
        
        nominalTypes.forEach(type => {
            const exists = khususKpiList.some(item => (item.kpiName || '').toLowerCase().includes(type.name.toLowerCase()));
            if (!exists) {
                // Ambil target dari nominalTargets atau default
                const targetVal = nominalTargets?.[type.key as keyof typeof nominalTargets] || type.default;
                
                khususKpiList.push({
                    id: `default-${type.key}`,
                    employeeId: String(selectedEmployee),
                    kpiName: type.name,
                    targetValue: targetVal,
                    actualValue: 0,
                    targetUnit: 'Rp',
                    category: 'outcome',
                    period: 'N/A',
                    score: 0
                } as any);
            }
        });

        // ===== WLA FTE Calculation =====
        const allApprovedLogs = wlaLogs.filter(log => log.status_approval === 'approved');

        const wlaActivityMap = new Map<string, { activityName: string; category: string; totalDurasi: number; totalFrekuensi: number }>();
        allApprovedLogs.forEach(log => {
            // Skip nominal/special activities for rincian table
            if (isNominal(log.activityName || '')) return;
            const key = String(log.id_activity_library || log.activityName);
            const existing = wlaActivityMap.get(key);
            if (existing) {
                existing.totalDurasi += Number(log.total_durasi_terhitung) || 0;
                existing.totalFrekuensi += Number(log.frekuensi) || 0;
            } else {
                wlaActivityMap.set(key, {
                    activityName: log.activityName || key,
                    category: log.category || '',
                    totalDurasi: Number(log.total_durasi_terhitung) || 0,
                    totalFrekuensi: Number(log.frekuensi) || 0
                });
            }
        });
        const wlaActivityItems = Array.from(wlaActivityMap.values()).sort((a, b) => b.totalDurasi - a.totalDurasi);

        const totalDurasiMenit = allApprovedLogs.reduce((sum, log) => sum + (Number(log.total_durasi_terhitung) || 0), 0);
        const totalFrekuensi = allApprovedLogs.reduce((sum, log) => sum + (Number(log.frekuensi) || 0), 0);
        const today = new Date().toISOString().slice(0, 10);
        const effectiveEndDate = endDate && endDate > today ? today : endDate;
        const workingDays = startDate && effectiveEndDate ? getWorkingDays(startDate, effectiveEndDate) : 1;
        const targetMinutes = EFFECTIVE_WORKING_MINUTES * workingDays;
        const wlaPercentage = targetMinutes > 0 ? Math.min((totalDurasiMenit / targetMinutes) * 100, 100) : 0;

        // ===== KPI Khusus Calculation (Dynamic) =====
        const khususItemsWithPct = khususKpiList.map(k => {
            const name = (k.kpiName || '').toLowerCase();
            const nominalFlag = isNominal(name, k.targetUnit);
            
            let actual = Number(k.actualValue) || 0;
            let target = Number(k.targetValue) || 0;

            // Handle default nominal targets if not set in KPI
            if (nominalFlag && target < 1000000) {
                if (name.includes('npl')) target = empNplTarget;
                else if (name.includes('pemasaran kredit')) target = empKreditTarget;
                else if (name.includes('pemasaran dana')) target = empDanaTarget;
            }

            // Sync from WLA if nominal and actual is empty
            if (nominalFlag && actual === 0) {
                const matchingLogs = wlaLogs.filter(log => (log.activityName || '').toLowerCase().includes(name) && log.status_approval === 'approved');
                actual = matchingLogs.reduce((sum, log) => sum + (Number(log.nominal_rupiah) || 0), 0);
            }

            const percentage = target === 0 ? (actual > 0 ? 100 : 0) : Math.min((actual / target) * 100, 100);

            return {
                id: k.id,
                kpiName: k.kpiName,
                targetValue: target,
                actualValue: actual,
                targetUnit: k.targetUnit || (nominalFlag ? 'Rp' : '%'),
                pct: percentage,
                isNominal: nominalFlag
            };
        });

        let khususPercentage = 0;
        if (khususItemsWithPct.length > 0) {
            // Calculate weighted average or simple average? 
            // The request implies they represent the 20% portion.
            khususPercentage = khususItemsWithPct.reduce((sum, i) => sum + i.pct, 0) / khususItemsWithPct.length;
        }

        // Apply 80/20 rule
        const finalWla = wlaPercentage * 0.80;
        const finalKhusus = khususPercentage * 0.20;
        const finalTotal = finalKhusus + finalWla;

        return {
            khususRawCount: khususKpiList.length,
            khususItems: khususItemsWithPct,
            wlaActivityItems,
            totalDurasiMenit,
            totalFrekuensi,
            targetMinutes,
            workingDays,
            khususPercentage,
            wlaPercentage,
            finalKhusus,
            finalWla,
            finalTotal
        };
    }, [kpis, wlaLogs, startDate, endDate]);

    return (
        <div className="bg-white rounded-lg shadow mt-6 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Monitoring KPI</h2>
                    <p className="text-sm text-gray-500">
                        Hitungan otomatis total pencapaian KPI ({selectedPeriodLabel}). <br/>
                        Komposisi: <b className="text-blue-700">80% dari WLA</b> dan <b className="text-purple-700">20% dari KPI Khusus</b> (Pemasaran Kredit, Pemasaran Dana, NPL).
                    </p>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="print:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300"
                >
                    <Printer size={18} />
                    <span>Cetak PDF</span>
                </button>
            </div>

            {/* Print Only Header (Gap 6) */}
            <div className="hidden print:block mb-8 pb-6 border-b-2 border-gray-100">
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Nama Pegawai</p>
                        <p className="text-base font-extrabold text-blue-900">{selectedEmployeeName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Periode Laporan</p>
                        <p className="text-base font-extrabold text-indigo-900">{selectedPeriodLabel}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 flex gap-4 items-center flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Pegawai:</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        disabled={role === 'employee'}>
                        <option value="">Semua</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.nip})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Periode:</label>
                    <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                        <option value="">Semua Periode</option>
                        {periodOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* WLA Card */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                    </div>
                    <h3 className="text-blue-800 font-semibold mb-1 relative z-10">Beban Kerja / FTE (80%)</h3>
                    <p className="text-sm text-blue-600 mb-3 relative z-10">{summary.totalDurasiMenit} menit ({(summary.totalDurasiMenit / 60).toFixed(1)} jam) — {summary.workingDays} hari kerja</p>
                    <div className="text-3xl font-bold text-blue-900 mb-1 relative z-10">
                        {summary.wlaPercentage.toFixed(1)}% <span className="text-lg font-normal text-blue-700">/ 100%</span>
                    </div>
                    <div className="text-sm text-blue-700 mt-4 pt-3 border-t border-blue-200 relative z-10">
                        Poin ke Total: <b className="text-lg">{summary.finalWla.toFixed(1)}%</b>
                    </div>
                </div>

                {/* KPI Khusus Card */}
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
                    </div>
                    <h3 className="text-purple-800 font-semibold mb-1 relative z-10">Pencapaian Khusus (20%)</h3>
                    <p className="text-sm text-purple-600 mb-3 relative z-10">{summary.khususRawCount} Item KPI</p>
                    <div className="text-3xl font-bold text-purple-900 mb-1 relative z-10">
                        {summary.khususPercentage.toFixed(1)}% <span className="text-lg font-normal text-purple-700">/ 100%</span>
                    </div>
                    <div className="text-sm text-purple-700 mt-4 pt-3 border-t border-purple-200 relative z-10">
                        Poin ke Total: <b className="text-lg">{summary.finalKhusus.toFixed(1)}%</b>
                    </div>
                </div>

                {/* Total Achievement */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200 flex flex-col justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </div>
                    <h3 className="text-green-800 font-semibold mb-2 relative z-10 text-lg">Total Pencapaian Akhir</h3>
                    <div className="text-5xl font-extrabold text-green-700 relative z-10">
                        {summary.finalTotal.toFixed(2)}<span className="text-3xl">%</span>
                    </div>
                    <div className="mt-3 relative z-10 flex items-center">
                        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", getScoreCategory(summary.finalTotal).className)}>
                            {getScoreCategory(summary.finalTotal).label}
                        </span>
                        <span className="text-xs text-green-700 ml-2">/ 100%</span>
                    </div>
                </div>
            </div>

            {/* Tables for transparency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs mr-2">80%</span>
                        Rincian Beban Kerja WLA
                    </h4>
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Frekuensi</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {summary.wlaActivityItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900 font-medium">{item.activityName}</div>
                                            {item.category && <div className="text-xs text-gray-400">{item.category}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">{item.totalFrekuensi}x</td>
                                        <td className="px-4 py-3 text-center font-medium text-blue-700">{item.totalDurasi} menit</td>
                                    </tr>
                                ))}
                                {summary.wlaActivityItems.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500 bg-gray-50/50">Tidak ada data WLA pada periode ini.</td></tr>
                                )}
                            </tbody>
                            {summary.wlaActivityItems.length > 0 && (
                                <tfoot className="bg-gray-50 divide-y divide-gray-200 border-t border-gray-200">
                                    <tr>
                                        <td className="px-4 py-3 text-red-600 font-bold text-center">TOTAL</td>
                                        <td className="px-4 py-3 text-red-600 font-bold text-center">{summary.totalFrekuensi}x</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="text-red-600 font-bold">{summary.totalDurasiMenit} menit</div>
                                            <div className="text-xs text-gray-500">Target: {summary.targetMinutes} menit ({summary.workingDays} hari × 480)</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-center" colSpan={2}>Beban (FTE)</td>
                                        <td className={`px-4 py-3 text-center font-bold text-lg ${getFteStatus(summary.wlaPercentage).color}`}>
                                            {summary.wlaPercentage.toFixed(1)}%
                                            <span className="text-xs font-normal ml-1">({getFteStatus(summary.wlaPercentage).label})</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs mr-2">20%</span>
                        Rincian KPI Khusus
                    </h4>
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama KPI</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Realisasi / Target</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Capaian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {summary.khususItems.map(k => (
                                    <tr key={k.id} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 font-medium">{k.kpiName}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="font-bold text-gray-700">
                                                {formatKpiValue(Number(k.actualValue), k.targetUnit)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Target: {formatKpiValue(Number(k.targetValue), k.targetUnit)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-purple-700">{k.pct.toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {summary.khususItems.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500 bg-gray-50/50">Tidak ada data KPI Khusus pada periode ini.</td></tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 divide-y divide-gray-200 border-t border-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-red-600 font-bold text-center">TOTAL</td>
                                    <td className="px-4 py-3 text-red-600 font-bold text-center text-xs">
                                        {formatNominal(summary.khususItems.reduce((acc, curr) => acc + (Number(curr.actualValue) || 0), 0))} <br/>
                                        <span className="text-[10px] opacity-70">vs Target {formatNominal(summary.khususItems.reduce((acc, curr) => acc + (Number(curr.targetValue) || 0), 0))}</span>
                                    </td>
                                    <td className="px-4 py-3 text-red-600 font-bold text-center">
                                        {summary.khususPercentage.toFixed(1)}%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="mt-16 text-center text-black font-medium pb-8 pt-8 text-sm w-full">
                <p className="mb-8">Mengetahui</p>
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col items-center">
                        <p className="font-semibold mb-24">Direktur Utama</p>
                        <div className="border-t border-black w-64 pt-2">
                            <p className="font-bold uppercase">{directors?.utama || 'SAPTO NUGROHO SE.,MSI'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="font-semibold mb-24">Direktur YMFK</p>
                        <div className="border-t border-black w-64 pt-2">
                            <p className="font-bold uppercase">{directors?.ymfk || 'IFAN ARDANA ,SE.,MSI'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KpiMonitoringView;
