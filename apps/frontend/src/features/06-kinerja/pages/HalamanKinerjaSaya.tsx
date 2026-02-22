import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getPenilaianKinerjaByEmployeeId, updateEmployeeFeedback } from '../api/kinerjaApi';
import { getKpiTargets } from '../api/kpiApi';
import { Kinerja, KpiTarget } from '../types';
import DetailKinerja from '../components/DetailKinerja';
import { Target, TrendingUp, Award, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/app/providers/ToastContext';

const HalamanKinerjaSaya: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [latestPerformance, setLatestPerformance] = useState<Kinerja | null>(null);
  const [allPerformances, setAllPerformances] = useState<Kinerja[]>([]);
  const [kpis, setKpis] = useState<KpiTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showPerformanceDetail, setShowPerformanceDetail] = useState(false);

  // Self-assessment state (Gap 3)
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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

  // Fetch performance reviews
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user || !user.employeeId) return;
      try {
        setLoading(true);
        const response = await getPenilaianKinerjaByEmployeeId(user.employeeId);
        const kinerjaList = response.data.data || [];
        setAllPerformances(kinerjaList);
        if (kinerjaList.length > 0) {
          setLatestPerformance(kinerjaList[0]);
        }
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat data kinerja');
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [user]);

  // Fetch KPI targets
  useEffect(() => {
    const fetchKpis = async () => {
      if (!user || !user.employeeId) return;
      try {
        setKpiLoading(true);
        const filters: any = { employeeId: user.employeeId };
        if (selectedPeriod) filters.period = selectedPeriod;
        const res = await getKpiTargets(filters);
        setKpis(res.data?.data || []);
      } catch (err) {
        console.error('Gagal memuat KPI:', err);
      }
      setKpiLoading(false);
    };
    fetchKpis();
  }, [user, selectedPeriod]);

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

  // Self-assessment submit (Gap 3)
  const handleFeedbackSubmit = async () => {
    if (!latestPerformance || !feedbackText.trim()) return;
    try {
      setFeedbackSubmitting(true);
      await updateEmployeeFeedback(latestPerformance.id, feedbackText.trim());
      addToast('Umpan balik berhasil dikirim', 'success');
      // Update local state
      setLatestPerformance({ ...latestPerformance, employeeFeedback: feedbackText.trim() });
      setFeedbackText('');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Gagal mengirim umpan balik', 'error');
    }
    setFeedbackSubmitting(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Kinerja Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat target KPI, progres pencapaian, dan hasil penilaian kinerja Anda.</p>
      </div>

      {/* ===== SECTION 1: KPI TARGETS (Gap 1) ===== */}
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
                    {/* Progress bar */}
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

      {/* ===== SECTION 3: SELF-ASSESSMENT (Gap 3) ===== */}
      {latestPerformance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Umpan Balik Saya</h2>
          </div>
          <div className="p-6">
            {latestPerformance.employeeFeedback ? (
              <div>
                <p className="text-sm text-gray-500 mb-1">Umpan balik Anda sudah terkirim:</p>
                <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-800">
                  {latestPerformance.employeeFeedback}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Berikan tanggapan atau umpan balik Anda terhadap penilaian kinerja dari atasan.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                  placeholder="Tulis umpan balik, tanggapan, atau refleksi Anda di sini..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackSubmitting || !feedbackText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {feedbackSubmitting ? 'Mengirim...' : 'Kirim Umpan Balik'}
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
