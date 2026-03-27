import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getKpiTargets } from '../api/kpiApi';
import { Kinerja, KpiTarget } from '../types';
import DetailKinerja from '../components/DetailKinerja';
import { Target, Award, ChevronDown, ChevronUp, ClipboardCheck, Save, Send, BarChart3 } from 'lucide-react';
import { useToast } from '@/app/providers/ToastContext';
import {
  useEmployeePerformanceReviews,
  useSubmitSelfAssessmentMutation
} from '../hooks/usePerformanceManagementQuery';

interface SelfAssessmentKpiItem {
  kpiId: string;
  metric: string;
  selfScore: number;
  reason: string;
}

const HalamanKinerjaSaya: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [latestPerformance, setLatestPerformance] = useState<Kinerja | null>(null);
  const [_allPerformances, setAllPerformances] = useState<Kinerja[]>([]);
  const [kpis, setKpis] = useState<KpiTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showPerformanceDetail, setShowPerformanceDetail] = useState(false);

  // Self-Assessment state
  const [saKpis, setSaKpis] = useState<SelfAssessmentKpiItem[]>([]);
  const [saStrengths, setSaStrengths] = useState('');
  const [saAreas, setSaAreas] = useState('');
  const [saSubmitting, setSaSubmitting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const employeeId = user?.employeeId;
  const performanceReviewsQuery = useEmployeePerformanceReviews(employeeId);
  const submitSelfAssessmentMutation = useSubmitSelfAssessmentMutation();

  // Period options
  const periodOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1, currentYear + 2];
    const options: { value: string; label: string }[] = [];
    years.forEach(y => {
      options.push({ value: `${y}-S1`, label: `${y} - Semester 1` });
      options.push({ value: `${y}-S2`, label: `${y} - Semester 2` });
      options.push({ value: `${y}-Q1`, label: `${y} - Kuartal 1` });
      options.push({ value: `${y}-Q2`, label: `${y} - Kuartal 2` });
      options.push({ value: `${y}-Q3`, label: `${y} - Kuartal 3` });
      options.push({ value: `${y}-Q4`, label: `${y} - Kuartal 4` });
    });
    return options;
  }, []);

  useEffect(() => {
    if (!employeeId) {
      return;
    }

    const kinerjaList = (performanceReviewsQuery.data ?? []) as Kinerja[];
    setAllPerformances(kinerjaList);
    setLoading(performanceReviewsQuery.isLoading);
    setError(performanceReviewsQuery.error ? 'Gagal memuat data kinerja' : null);

    if (kinerjaList.length > 0) {
      const latest = kinerjaList[0];
      setLatestPerformance(latest);
      if ((latest as any).selfAssessmentKpis && Array.isArray((latest as any).selfAssessmentKpis)) {
        setSaKpis((latest as any).selfAssessmentKpis);
      }
      if ((latest as any).selfAssessmentStrengths) setSaStrengths((latest as any).selfAssessmentStrengths);
      if ((latest as any).selfAssessmentAreas) setSaAreas((latest as any).selfAssessmentAreas);
    } else {
      setLatestPerformance(null);
    }
  }, [employeeId, performanceReviewsQuery.data, performanceReviewsQuery.error, performanceReviewsQuery.isLoading]);

  // Fetch KPI targets
  const kpiTargetsQuery = useQuery({
    queryKey: ['performance', 'my-kpis', employeeId ?? 'anonymous', selectedPeriod || 'all'],
    queryFn: async () => {
      if (!employeeId) {
        return [];
      }

      const filters: Record<string, string> = { employeeId };
      if (selectedPeriod) {
        filters.period = selectedPeriod;
      }

      const res = await getKpiTargets(filters);
      return (res.data?.data || []) as KpiTarget[];
    },
    enabled: !!employeeId,
    staleTime: 30 * 1000
  });

  useEffect(() => {
    const kpiList = kpiTargetsQuery.data ?? [];
    setKpis(kpiList);
    setKpiLoading(kpiTargetsQuery.isLoading);

    if (saKpis.length === 0 && kpiList.length > 0 && (latestPerformance as any)?.selfAssessmentStatus !== 'submitted') {
      setSaKpis(kpiList.map((k: KpiTarget) => ({
        kpiId: k.id || '',
        metric: k.kpiName,
        selfScore: 0,
        reason: '',
      })));
    }
  }, [kpiTargetsQuery.data, kpiTargetsQuery.isLoading, latestPerformance, saKpis.length]);

  // KPI summary calculations
  const totalWeight = kpis.reduce((sum, k) => sum + (k.weight || 0), 0);
  const weightedScore = totalWeight > 0
    ? kpis.reduce((sum, k) => sum + (k.score || 0) * (k.weight || 0), 0) / totalWeight
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 5) return 'Sangat Baik';
    if (score >= 4) return 'Baik';
    if (score >= 3) return 'Cukup';
    if (score >= 2) return 'Kurang';
    if (score >= 1) return 'Sangat Kurang';
    return '-';
  };

  const getProgressColor = (ratio: number) => {
    if (ratio >= 1) return 'bg-emerald-500';
    if (ratio >= 0.8) return 'bg-blue-500';
    if (ratio >= 0.6) return 'bg-yellow-500';
    if (ratio >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Self-assessment handlers
  const handleSaKpiChange = (index: number, field: 'selfScore' | 'reason', value: any) => {
    const updated = [...saKpis];
    updated[index] = { ...updated[index], [field]: field === 'selfScore' ? Number(value) : value };
    setSaKpis(updated);
  };

  const handleSelfAssessmentSubmit = async (status: 'draft' | 'submitted') => {
    if (!latestPerformance) return;
    try {
      setSaSubmitting(true);
      const response = await submitSelfAssessmentMutation.mutateAsync({
        id: latestPerformance.id,
        data: {
          selfAssessmentKpis: saKpis,
          selfAssessmentStrengths: saStrengths,
          selfAssessmentAreas: saAreas,
          selfAssessmentStatus: status,
        }
      });
      const updatedData = response.data?.data || response.data;
      setLatestPerformance({ ...latestPerformance, ...updatedData });
      addToast(
        status === 'submitted' ? 'Self-Assessment berhasil dikirim!' : 'Draft tersimpan',
        'success'
      );
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Gagal menyimpan self-assessment', 'error');
    }
    setSaSubmitting(false);
  };

  const isSubmitted = (latestPerformance as any)?.selfAssessmentStatus === 'submitted';
  const selfAvgScore = saKpis.length > 0
    ? saKpis.reduce((sum, k) => sum + (k.selfScore || 0), 0) / saKpis.length
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Kinerja Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat target KPI, progres pencapaian, dan isi self-assessment Anda.</p>
      </div>

      {/* ===== SECTION 1: KPI TARGETS ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Target KPI Saya</h2>
          </div>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Semua Periode</option>
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {kpiLoading ? (
          <div className="p-8 text-center text-gray-400">Memuat KPI...</div>
        ) : kpis.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Belum ada target KPI untuk periode ini.</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Card */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total KPI</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bobot</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalWeight}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Skor Rata-rata</p>
                  <p className={`text-2xl font-bold mt-1 ${getScoreColor(weightedScore)}`}>
                    {weightedScore.toFixed(2)} <span className="text-sm font-normal text-gray-400">/ 5</span>
                  </p>
                  <p className={`text-xs font-medium ${getScoreColor(weightedScore)}`}>{getScoreLabel(weightedScore)}</p>
                </div>
              </div>
            </div>

            {/* KPI Progress Cards */}
            <div className="p-6 space-y-4">
              {kpis.map(kpi => {
                const ratio = kpi.targetValue > 0 ? (kpi.actualValue || 0) / kpi.targetValue : 0;
                const progressPercent = Math.min(ratio * 100, 100);
                return (
                  <div key={kpi.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{kpi.kpiName}</h4>
                        {kpi.notes && <p className="text-xs text-gray-400 mt-0.5">{kpi.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {kpi.score > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${kpi.score >= 4 ? 'bg-emerald-50 text-emerald-700' :
                            kpi.score >= 3 ? 'bg-yellow-50 text-yellow-700' :
                              kpi.score >= 2 ? 'bg-orange-50 text-orange-700' :
                                'bg-red-50 text-red-700'
                            }`}>
                            Skor {kpi.score} — {getScoreLabel(kpi.score)}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">Bobot {kpi.weight}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(ratio)}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-600 whitespace-nowrap w-24 text-right">
                        {kpi.actualValue || 0} / {kpi.targetValue} {kpi.targetUnit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ===== SECTION 2: PENILAIAN KINERJA ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowPerformanceDetail(!showPerformanceDetail)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Penilaian Kinerja</h2>
            {latestPerformance && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${latestPerformance.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                latestPerformance.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                {latestPerformance.status}
              </span>
            )}
          </div>
          {showPerformanceDetail ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showPerformanceDetail && (
          <div className="border-t border-gray-100">
            {loading && <div className="p-8 text-center text-gray-400">Memuat...</div>}
            {error && <div className="p-4 text-red-500 text-sm">{error}</div>}
            {latestPerformance ? (
              <div className="p-6">
                <DetailKinerja performanceId={latestPerformance.id} />
              </div>
            ) : (
              !loading && <div className="p-8 text-center text-gray-400">Belum ada penilaian kinerja.</div>
            )}
          </div>
        )}
      </div>

      {/* ===== SECTION 3: SELF-ASSESSMENT ===== */}
      {latestPerformance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Self-Assessment</h2>
              {isSubmitted && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  ✅ Sudah Dikirim
                </span>
              )}
              {(latestPerformance as any).selfAssessmentStatus === 'draft' && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                  📝 Draft
                </span>
              )}
            </div>
            {isSubmitted && latestPerformance.overallScore > 0 && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                {showComparison ? 'Sembunyikan' : 'Lihat Perbandingan'}
              </button>
            )}
          </div>

          {/* Comparison View (self vs supervisor) */}
          {showComparison && isSubmitted && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Perbandingan Skor: Self-Assessment vs Atasan</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Skor Self-Assessment</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selfAvgScore)}`}>{selfAvgScore.toFixed(2)}</p>
                  <p className={`text-xs ${getScoreColor(selfAvgScore)}`}>{getScoreLabel(selfAvgScore)}</p>
                </div>
                <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Skor Atasan</p>
                  <p className={`text-2xl font-bold ${getScoreColor(latestPerformance.overallScore)}`}>{latestPerformance.overallScore.toFixed(2)}</p>
                  <p className={`text-xs ${getScoreColor(latestPerformance.overallScore)}`}>{getScoreLabel(latestPerformance.overallScore)}</p>
                </div>
              </div>
              {saKpis.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-purple-100">
                        <th className="py-2 pr-4">KPI</th>
                        <th className="py-2 px-4 text-center">Self</th>
                        <th className="py-2 px-4 text-center">Atasan</th>
                        <th className="py-2 px-4 text-center">Selisih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saKpis.map((saKpi, idx) => {
                        const matchKpi = kpis.find(k => k.kpiName === saKpi.metric || k.id === saKpi.kpiId);
                        const supervisorScore = matchKpi?.score || 0;
                        const gap = saKpi.selfScore - supervisorScore;
                        return (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="py-2 pr-4 text-gray-700">{saKpi.metric}</td>
                            <td className={`py-2 px-4 text-center font-bold ${getScoreColor(saKpi.selfScore)}`}>{saKpi.selfScore}</td>
                            <td className={`py-2 px-4 text-center font-bold ${getScoreColor(supervisorScore)}`}>{supervisorScore || '-'}</td>
                            <td className={`py-2 px-4 text-center font-semibold ${gap > 0 ? 'text-blue-600' : gap < 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {supervisorScore > 0 ? (gap > 0 ? `+${gap}` : gap) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            {isSubmitted ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Self-Assessment Anda telah dikirim pada {(latestPerformance as any).selfAssessmentDate ? new Date((latestPerformance as any).selfAssessmentDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}.</p>

                {saKpis.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Penilaian KPI Anda:</h4>
                    <div className="space-y-2">
                      {saKpis.map((kpi, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-purple-50 rounded-lg px-4 py-2">
                          <span className="flex-1 text-sm text-gray-700">{kpi.metric}</span>
                          <span className={`font-bold text-sm ${getScoreColor(kpi.selfScore)}`}>Skor {kpi.selfScore}</span>
                          {kpi.reason && <span className="text-xs text-gray-400 max-w-[200px] truncate">— {kpi.reason}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {saStrengths && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Kekuatan Saya:</h4>
                    <div className="bg-emerald-50 rounded-lg p-3 text-sm text-gray-700">{saStrengths}</div>
                  </div>
                )}
                {saAreas && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Area yang Perlu Ditingkatkan:</h4>
                    <div className="bg-amber-50 rounded-lg p-3 text-sm text-gray-700">{saAreas}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-gray-500">
                  Berikan penilaian diri Anda terhadap pencapaian KPI dan kinerja selama periode ini. Atasan akan melihat self-assessment ini saat melakukan review.
                </p>

                {saKpis.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Penilaian KPI Diri Sendiri:</h4>
                    <div className="space-y-3">
                      {saKpis.map((kpi, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex-1 text-sm font-medium text-gray-800">{kpi.metric}</span>
                            <select
                              value={kpi.selfScore}
                              onChange={e => handleSaKpiChange(idx, 'selfScore', e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40"
                            >
                              <option value={0}>Pilih Skor</option>
                              <option value={1}>1 — Sangat Kurang</option>
                              <option value={2}>2 — Kurang</option>
                              <option value={3}>3 — Cukup</option>
                              <option value={4}>4 — Baik</option>
                              <option value={5}>5 — Sangat Baik</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={kpi.reason}
                            onChange={e => handleSaKpiChange(idx, 'reason', e.target.value)}
                            placeholder="Alasan penilaian (opsional)..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
                          />
                        </div>
                      ))}
                    </div>
                    {selfAvgScore > 0 && (
                      <div className="mt-3 text-sm text-gray-500 text-right">
                        Rata-rata skor: <span className={`font-bold ${getScoreColor(selfAvgScore)}`}>{selfAvgScore.toFixed(2)}</span> — {getScoreLabel(selfAvgScore)}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kekuatan Saya:</label>
                  <textarea
                    value={saStrengths}
                    onChange={e => setSaStrengths(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                    placeholder="Jelaskan kekuatan dan hal positif yang Anda capai selama periode ini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area yang Perlu Saya Tingkatkan:</label>
                  <textarea
                    value={saAreas}
                    onChange={e => setSaAreas(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                    placeholder="Jelaskan area yang ingin Anda tingkatkan dan rencana perbaikannya..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleSelfAssessmentSubmit('draft')}
                    disabled={saSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Setelah dikirim, self-assessment tidak dapat diubah. Lanjutkan?')) {
                        handleSelfAssessmentSubmit('submitted');
                      }
                    }}
                    disabled={saSubmitting || saKpis.every(k => k.selfScore === 0)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {saSubmitting ? 'Mengirim...' : 'Kirim Self-Assessment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKinerjaSaya;
