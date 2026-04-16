import React, { useMemo } from 'react';
import { KpiTarget } from '../types';
import { useAdminWlaDetailLogs, useDirectorNames } from '../hooks/usePerformanceManagementQuery';
import { Printer } from 'lucide-react';

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

const KpiMonitoringView: React.FC<KpiMonitoringViewProps> = ({ 
    isActive, 
    kpis, 
    period,
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

    if (!isActive) return null;

    const summary = useMemo(() => {
        // 1. Identify KPI Khusus vs WLA
        const isNPL = (name: string) => name.toLowerCase().includes('npl');
        const isKredit = (name: string) => name.toLowerCase().includes('pemasaran kredit');
        const isDana = (name: string) => name.toLowerCase().includes('pemasaran dana');
        
        const isKpiKhusus = (name: string = '') => isNPL(name) || isKredit(name) || isDana(name);

        const rawKhususItems = kpis.filter(k => isKpiKhusus(k.kpiName));
        const wlaItems = kpis.filter(k => !isKpiKhusus(k.kpiName));

        const getPct = (item: KpiTarget) => {
            const target = Number(item.targetValue) || 0;
            const actual = Number(item.actualValue) || 0;
            if (target === 0) return 0;
            const res = (actual / target) * 100;
            return res > 100 ? 100 : res;
        };

        const wlaItemsWithPct = wlaItems.map(k => ({ ...k, pct: getPct(k) }));

        // Aggregate KPI Khusus into exactly 3 standardized categories, using explicit targets if any, or pulling directly from WLA logs
        const aggregateKhususWla = (categoryName: string, filterFn: (name: string) => boolean) => {
            // Did they explicitly define targets?
            const explicitTargets = rawKhususItems.filter(k => filterFn(k.kpiName));
            const explicitTargetTotal = explicitTargets.reduce((sum, i) => sum + (Number(i.targetValue) || 0), 0);
            
            // Raw WLA logs matching this category
            const matchingLogs = wlaLogs.filter(log => filterFn(log.activityName || '') && log.status_approval === 'approved');
            const wlaActual = matchingLogs.reduce((sum, log) => sum + (Number(log.frekuensi) || 0), 0);

            // If no explicit targets set, fallback target is 0. 
            // In WLA-only mode: cap at 100% just in case, but assume 1 action is progress.
            const target = explicitTargetTotal;
            const percentage = target === 0 ? (wlaActual > 0 ? 100 : 0) : Math.min((wlaActual / target) * 100, 100);

            return {
                id: categoryName,
                kpiName: categoryName,
                targetValue: target, // If 0, UI might show it differently but accurate
                actualValue: wlaActual, // Pulled straight from WLA logs
                targetUnit: '',
                pct: percentage,
                count: explicitTargets.length > 0 ? explicitTargets.length : (wlaActual > 0 ? 1 : 0) // Counter tracking if any setup or action holds
            };
        };

        const khususItemsWithPct = [
            aggregateKhususWla('Penanganan NPL', isNPL),
            aggregateKhususWla('Perolehan Pemasaran Kredit', isKredit),
            aggregateKhususWla('Perolehan Pemasaran Dana', isDana)
        ]; // Always show the 3 main categories for KPI Khusus

        // Use weighted average if weights are provided, otherwise simple average
        const weightedAvgPct = (items: any[]) => {
            if (items.length === 0) return 0;
            const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
            if (totalWeight > 0) {
                return items.reduce((sum, item) => sum + (item.pct * (item.weight || 0)), 0) / totalWeight;
            }
            return items.reduce((sum, item) => sum + item.pct, 0) / items.length;
        };

        const wlaPercentage = weightedAvgPct(wlaItemsWithPct);
        
        let khususPercentage = 0;
        if (khususItemsWithPct.length > 0) {
            khususPercentage = khususItemsWithPct.reduce((sum, i) => sum + i.pct, 0) / khususItemsWithPct.length;
        }

        // Apply 80/20 rule
        const finalWla = wlaPercentage * 0.80;
        const finalKhusus = khususPercentage * 0.20;
        const finalTotal = finalKhusus + finalWla;

        return {
            khususRawCount: rawKhususItems.length,
            khususItems: khususItemsWithPct,
            wlaItems: wlaItemsWithPct,
            khususPercentage,
            wlaPercentage,
            finalKhusus,
            finalWla,
            finalTotal
        };
    }, [kpis]);

    return (
        <div className="bg-white rounded-lg shadow mt-6 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Monitoring KPI</h2>
                    <p className="text-sm text-gray-500">
                        Hitungan otomatis total pencapaian KPI ({period === 'Semua Periode' ? 'Semua Periode' : `Periode: ${period}`}). <br/>
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
                    <h3 className="text-blue-800 font-semibold mb-1 relative z-10">Pencapaian WLA (80%)</h3>
                    <p className="text-sm text-blue-600 mb-3 relative z-10">{summary.wlaItems.length} Item KPI</p>
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
                    <div className="text-sm text-green-700 mt-3 pt-3 border-t border-green-200 relative z-10">
                        Dari maksimal pencapaian 100%
                    </div>
                </div>
            </div>

            {/* Tables for transparency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs mr-2">80%</span>
                        Rincian KPI WLA
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
                                {summary.wlaItems.map(k => (
                                    <tr key={k.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 font-medium">{k.kpiName}</td>
                                        <td className="px-4 py-3 text-center">
                                            {k.actualValue || 0} / {k.targetValue}
                                            <span className="text-gray-400 ml-1 text-xs">{k.targetUnit === 'jumlah' ? '' : k.targetUnit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-blue-700">{k.pct.toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {summary.wlaItems.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500 bg-gray-50/50">Tidak ada data KPI WLA pada periode ini.</td></tr>
                                )}
                            </tbody>
                            {summary.wlaItems.length > 0 && (
                                <tfoot className="bg-gray-50 divide-y divide-gray-200 border-t border-gray-200">
                                    <tr>
                                        <td className="px-4 py-3 text-red-600 font-bold text-center">TOTAL</td>
                                        <td className="px-4 py-3 text-red-600 font-bold text-center">
                                            {summary.wlaItems.reduce((acc, curr) => acc + (Number(curr.actualValue) || 0), 0)} / {summary.wlaItems.reduce((acc, curr) => acc + (Number(curr.targetValue) || 0), 0)}
                                        </td>
                                        <td className="px-4 py-3 text-red-600 font-bold text-center">
                                            {summary.wlaPercentage.toFixed(1)}%
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
                                            {k.actualValue || 0} / {k.targetValue}
                                            <span className="text-gray-400 ml-1 text-xs">{k.targetUnit === 'jumlah' ? '' : k.targetUnit}</span>
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
                                    <td className="px-4 py-3 text-red-600 font-bold text-center">
                                        {summary.khususItems.reduce((acc, curr) => acc + (Number(curr.actualValue) || 0), 0)} / {summary.khususItems.reduce((acc, curr) => acc + (Number(curr.targetValue) || 0), 0)}
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
