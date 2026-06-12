// src/features/11-arsip-dokumen/components/StatistikDokumen.tsx
import React from 'react';
import {
  FileText, FileCheck, FileClock, AlertTriangle, Archive,
} from 'lucide-react';
import { ArsipDokumenStats, KATEGORI_LABEL } from '../types';

interface Props {
  stats: ArsipDokumenStats | null;
  loading: boolean;
  expiringCount?: number;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}> = ({ icon, label, value, color, sub }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 border ${color} transition-all hover:shadow-md`}>
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-3xl font-bold text-neutral-800 dark:text-white">{value}</span>
    </div>
    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</p>
    {sub && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{sub}</p>}
  </div>
);

const StatistikDokumen: React.FC<Props> = ({ stats, loading, expiringCount }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl h-28 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
        ))}
      </div>
    );
  }

  const total = stats?.byStatus.reduce((acc, s) => acc + s.jumlah, 0) ?? 0;
  const aktif = stats?.byStatus.find(s => s.status === 'aktif')?.jumlah ?? 0;
  const kadaluarsa = stats?.byStatus.find(s => s.status === 'kadaluarsa')?.jumlah ?? 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Archive size={18} className="text-indigo-600" />}
          label="Total Dokumen"
          value={total}
          color="border-indigo-100 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-950/20"
        />
        <StatCard
          icon={<FileCheck size={18} className="text-emerald-600" />}
          label="Aktif"
          value={aktif}
          color="border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
        />
        <StatCard
          icon={<FileClock size={18} className="text-amber-600" />}
          label="Kadaluarsa"
          value={kadaluarsa}
          color="border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20"
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-orange-600" />}
          label="Segera Kadaluarsa"
          value={expiringCount ?? stats?.expiringIn30Days ?? 0}
          color="border-orange-100 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
          sub="dalam 30 hari"
        />
      </div>

      {/* Per-kategori bar */}
      {stats && stats.byKategori.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3 flex items-center gap-2">
            <FileText size={15} />
            Distribusi per Kategori
          </p>
          <div className="space-y-2">
            {stats.byKategori.map(({ kategori, jumlah }) => {
              const pct = total > 0 ? Math.round((jumlah / total) * 100) : 0;
              return (
                <div key={kategori} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-36 flex-shrink-0 truncate">
                    {KATEGORI_LABEL[kategori as keyof typeof KATEGORI_LABEL] ?? kategori}
                  </span>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 w-8 text-right">
                    {jumlah}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistikDokumen;
