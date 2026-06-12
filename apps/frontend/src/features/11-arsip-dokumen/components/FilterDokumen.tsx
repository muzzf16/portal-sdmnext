// src/features/11-arsip-dokumen/components/FilterDokumen.tsx
import React from 'react';
import { Search, X } from 'lucide-react';
import {
  ArsipDokumenFilters,
  KategoriDokumen,
  StatusDokumen,
  TingkatKerahasiaan,
  KATEGORI_LABEL,
  STATUS_LABEL,
  KERAHASIAAN_LABEL,
} from '../types';

import { useAuth } from '../../../shared/contexts/AuthContext';

interface Props {
  filters: ArsipDokumenFilters;
  onChange: (f: Partial<ArsipDokumenFilters>) => void;
}

const KATEGORI_OPTIONS: KategoriDokumen[] = [
  'SK_DIREKSI', 'NOTULEN_RAPAT', 'NIB', 'SOP',
  'PERATURAN', 'PERJANJIAN', 'LEGALITAS', 'LAINNYA',
];

const STATUS_OPTIONS: StatusDokumen[] = ['aktif', 'kadaluarsa', 'dicabut'];

const KERAHASIAAN_OPTIONS: TingkatKerahasiaan[] = ['PUBLIK', 'INTERNAL', 'RAHASIA', 'SANGAT_RAHASIA'];

const FilterDokumen: React.FC<Props> = ({ filters, onChange }) => {
  const { user } = useAuth();
  const canViewRahasia = !!user?.role && ['admin', 'pimpinan', 'supervisor'].includes(user.role);

  const hasActiveFilters = !!(
    filters.kategori || filters.status || filters.tingkatKerahasiaan || filters.search ||
    filters.tanggalDari || filters.tanggalSampai
  );

  const clearFilters = () => {
    onChange({ kategori: '', status: '', tingkatKerahasiaan: '', search: '', tanggalDari: '', tanggalSampai: '', page: 1 });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 mb-5">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="arsip-search"
            type="text"
            placeholder="Cari judul, nomor, penerbit..."
            value={filters.search ?? ''}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
          />
        </div>

        {/* Kategori */}
        <div className="min-w-44">
          <select
            id="arsip-filter-kategori"
            value={filters.kategori ?? ''}
            onChange={e => onChange({ kategori: e.target.value as KategoriDokumen | '', page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
          >
            <option value="">Semua Kategori</option>
            {KATEGORI_OPTIONS.map(k => (
              <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="min-w-36">
          <select
            id="arsip-filter-status"
            value={filters.status ?? ''}
            onChange={e => onChange({ status: e.target.value as StatusDokumen | '', page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        {/* Kerahasiaan (Hanya untuk role yang bisa) */}
        {canViewRahasia && (
          <div className="min-w-36">
            <select
              id="arsip-filter-kerahasiaan"
              value={filters.tingkatKerahasiaan ?? ''}
              onChange={e => onChange({ tingkatKerahasiaan: e.target.value as TingkatKerahasiaan | '', page: 1 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
            >
              <option value="">Semua Sifat</option>
              {KERAHASIAAN_OPTIONS.map(k => (
                <option key={k} value={k}>{KERAHASIAAN_LABEL[k]}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tanggal dari */}
        <div className="min-w-36">
          <input
            id="arsip-filter-dari"
            type="date"
            value={filters.tanggalDari ?? ''}
            onChange={e => onChange({ tanggalDari: e.target.value, page: 1 })}
            title="Tanggal terbit mulai dari"
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
          />
        </div>

        {/* Tanggal sampai */}
        <div className="min-w-36">
          <input
            id="arsip-filter-sampai"
            type="date"
            value={filters.tanggalSampai ?? ''}
            onChange={e => onChange({ tanggalSampai: e.target.value, page: 1 })}
            title="Tanggal terbit sampai dengan"
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
          />
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            id="arsip-filter-clear"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterDokumen;
