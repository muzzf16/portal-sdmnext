import React, { useMemo, useState } from 'react';
import { AlertCircle, CalendarRange, CheckCircle2, PlayCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/app/providers/ToastContext';
import {
  useCreatePerformanceCycleReviewsMutation,
  useFinalizePerformanceCycleMutation,
  useOpenPerformancePeriodMutation,
  useSelectablePerformanceEmployees,
  useSyncPerformanceCycleKpiMutation,
} from '../hooks/usePerformanceManagementQuery';
import type { PerformanceCycleBatchPayload, PerformanceCycleBatchResult } from '../types';

const buildDefaultPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${month <= 6 ? 'S1' : 'S2'}`;
};

const formatResultTone = (status: 'success' | 'skipped' | 'failed') => {
  if (status === 'success') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'failed') {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const PerformanceCyclePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [period, setPeriod] = useState(buildDefaultPeriod());
  const [selfAssessmentDeadline, setSelfAssessmentDeadline] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>('');
  const [lastResult, setLastResult] = useState<PerformanceCycleBatchResult | null>(null);

  const employeesQuery = useSelectablePerformanceEmployees(user?.role, user?.employeeId, user?.name);
  const employees = useMemo(() => (employeesQuery.data ?? []) as Array<{ id?: string; name?: string; nip?: string; department?: string; position?: string }>, [employeesQuery.data]);
  const openPeriodMutation = useOpenPerformancePeriodMutation();
  const syncKpiMutation = useSyncPerformanceCycleKpiMutation();
  const createReviewsMutation = useCreatePerformanceCycleReviewsMutation();
  const finalizeMutation = useFinalizePerformanceCycleMutation();

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) => {
      const name = String(employee.name || '').toLowerCase();
      const nip = String(employee.nip || '').toLowerCase();
      const department = String(employee.department || '').toLowerCase();
      const position = String(employee.position || '').toLowerCase();
      return name.includes(keyword) || nip.includes(keyword) || department.includes(keyword) || position.includes(keyword);
    });
  }, [employees, search]);

  const selectedEmployeeSet = useMemo(() => new Set(selectedEmployeeIds), [selectedEmployeeIds]);
  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every((employee) => employee.id && selectedEmployeeSet.has(String(employee.id)));

  const isMutating =
    openPeriodMutation.isPending ||
    syncKpiMutation.isPending ||
    createReviewsMutation.isPending ||
    finalizeMutation.isPending;

  const buildPayload = (): PerformanceCycleBatchPayload => ({
    period,
    employeeIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
    selfAssessmentDeadline: selfAssessmentDeadline || undefined,
  });

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredEmployees.map((employee) => String(employee.id || '')).filter(Boolean);
    if (filteredIds.length === 0) {
      return;
    }

    setSelectedEmployeeIds((current) => {
      if (allFilteredSelected) {
        return current.filter((id) => !filteredIds.includes(id));
      }

      return Array.from(new Set([...current, ...filteredIds]));
    });
  };

  const handleBatchAction = async (
    actionLabel: string,
    executor: (payload: PerformanceCycleBatchPayload) => Promise<{ data?: { data?: PerformanceCycleBatchResult } }>
  ) => {
    if (!period.trim()) {
      addToast('Periode wajib diisi sebelum menjalankan proses.', 'error');
      return;
    }

    try {
      const payload = buildPayload();
      const response = await executor(payload);
      const result = response.data?.data;
      if (!result) {
        throw new Error('Hasil batch tidak ditemukan');
      }

      setLastAction(actionLabel);
      setLastResult(result);
      addToast(`${actionLabel} selesai: ${result.succeeded} sukses, ${result.skipped} dilewati, ${result.failed} gagal.`, 'success');
    } catch (error: any) {
      addToast(error?.response?.data?.message || error?.message || `Gagal menjalankan ${actionLabel.toLowerCase()}.`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-indigo-600" />
            Kontrol Siklus Kinerja
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Jalankan pembukaan periode, sinkronisasi KPI, pembuatan review batch, dan finalisasi periode dari satu panel admin.
          </p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 max-w-xl">
          <div className="font-semibold mb-1">Aturan batch</div>
          <div>`Open Period` hanya generate KPI dari ABK yang sudah approved.</div>
          <div>`Sync KPI` hanya menghitung WLA yang sudah approved.</div>
          <div>`Create Reviews` akan skip jika review periode itu sudah ada.</div>
          <div>`Finalize` hanya memfinalisasi review dengan status `Completed`.</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Parameter Siklus</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 py-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <input
              type="text"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              placeholder="Contoh: 2026-S1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-gray-500">Gunakan format seperti `2026-S1`, `2026-Q1`, atau `2026-03`.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Self-Assessment</label>
            <input
              type="date"
              value={selfAssessmentDeadline}
              onChange={(event) => setSelfAssessmentDeadline(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-gray-500">Dipakai saat membuat review batch. Kosong berarti otomatis +7 hari.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Pegawai</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, NIP, departemen, atau jabatan"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-gray-500">Biarkan tanpa seleksi untuk menjalankan proses ke semua pegawai aktif.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Target Pegawai</h2>
            <p className="text-sm text-gray-500">Pilih subset pegawai bila ingin menjalankan batch terbatas. Kosong berarti semua pegawai aktif.</p>
          </div>
          <button
            type="button"
            onClick={handleToggleSelectAllFiltered}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {allFilteredSelected ? 'Batalkan Pilih Filtered' : 'Pilih Semua Filtered'}
          </button>
        </div>
        <div className="max-h-72 overflow-auto px-6 py-4">
          {employeesQuery.isLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">Memuat daftar pegawai...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">Tidak ada pegawai yang cocok dengan filter.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.map((employee) => {
                const employeeId = String(employee.id || '');
                const checked = selectedEmployeeSet.has(employeeId);
                return (
                  <label
                    key={employeeId}
                    className={`rounded-lg border px-4 py-3 transition-colors ${
                      checked ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={checked}
                        onChange={() => handleToggleEmployee(employeeId)}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{employee.name || employeeId}</div>
                        <div className="text-xs text-gray-500">NIP: {employee.nip || '-'}</div>
                        <div className="text-xs text-gray-500">{employee.department || '-'}</div>
                        <div className="text-xs text-gray-400">{employee.position || '-'}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <button
          type="button"
          disabled={isMutating}
          onClick={() => handleBatchAction('Open Period', (payload) => openPeriodMutation.mutateAsync(payload))}
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlayCircle className="h-4 w-4" />
          Open Period
        </button>
        <button
          type="button"
          disabled={isMutating}
          onClick={() => handleBatchAction('Sync KPI', (payload) => syncKpiMutation.mutateAsync(payload))}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Approved WLA ke KPI
        </button>
        <button
          type="button"
          disabled={isMutating}
          onClick={() => handleBatchAction('Create Reviews', (payload) => createReviewsMutation.mutateAsync(payload))}
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          Create Review Batch
        </button>
        <button
          type="button"
          disabled={isMutating}
          onClick={() => handleBatchAction('Finalize Period', (payload) => finalizeMutation.mutateAsync(payload))}
          className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-4 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          Finalize Period
        </button>
      </div>

      {lastResult && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Hasil Batch Terakhir</h2>
              <p className="text-sm text-gray-500">
                {lastAction} untuk periode <span className="font-medium text-gray-700">{lastResult.period}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Diproses: {lastResult.processed}</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Sukses: {lastResult.succeeded}</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Dilewati: {lastResult.skipped}</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Gagal: {lastResult.failed}</span>
            </div>
          </div>
          <div className="overflow-x-auto px-6 py-4">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Pegawai</th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lastResult.details.map((detail) => (
                  <tr key={`${detail.employeeId}-${detail.status}-${detail.message}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{detail.employeeName || detail.employeeId}</div>
                      <div className="text-xs text-gray-500">{detail.employeeId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${formatResultTone(detail.status)}`}>
                        {detail.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        {detail.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{detail.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCyclePage;
