// src/features/11-arsip-dokumen/pages/HalamanArsipDokumen.tsx
import React, { useState, useCallback } from 'react';
import {
  Archive, Plus, LayoutGrid, LayoutList, ChevronLeft, ChevronRight,
  RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useArsipDokumen } from '../hooks/useArsipDokumen';
import {
  ArsipDokumen,
  KERAHASIAAN_LABEL,
  KERAHASIAAN_COLOR,
  KERAHASIAAN_ICON,
} from '../types';
import StatistikDokumen from '../components/StatistikDokumen';
import FilterDokumen from '../components/FilterDokumen';
import KartuDokumen from '../components/KartuDokumen';
import FormDokumen from '../components/FormDokumen';

type ViewMode = 'grid' | 'list';

const WRITE_ROLES = ['admin', 'pimpinan', 'supervisor'];

const HalamanArsipDokumen: React.FC = () => {
  const { user } = useAuth();
  const canWrite = !!(user?.role && WRITE_ROLES.includes(user.role));

  const {
    dokumen,
    stats,
    expiring,
    total,
    totalPages,
    loading,
    statsLoading,
    error,
    filters,
    updateFilters,
    refetch,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useArsipDokumen();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ArsipDokumen | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreateForm = useCallback(() => {
    setEditTarget(null);
    setShowForm(true);
    setActionError(null);
  }, []);

  const openEditForm = useCallback((doc: ArsipDokumen) => {
    setEditTarget(doc);
    setShowForm(true);
    setActionError(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditTarget(null);
  }, []);

  const onFormSubmit = useCallback(async (fd: FormData) => {
    if (editTarget) {
      await handleUpdate(editTarget.id, fd);
    } else {
      await handleCreate(fd);
    }
    closeForm();
    setDeleteMsg(null);
  }, [editTarget, handleCreate, handleUpdate, closeForm]);

  const onDelete = useCallback(async (id: string, judul: string) => {
    try {
      await handleDelete(id);
      setDeleteMsg(`Dokumen "${judul}" berhasil dihapus`);
      setTimeout(() => setDeleteMsg(null), 3000);
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? 'Gagal menghapus dokumen');
    }
  }, [handleDelete]);

  const currentPage = filters.page ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Archive size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Arsip Dokumen Perusahaan
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Kelola SK Direksi, Notulen Rapat, NIB, SOP, dan dokumen lainnya
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
              title="List view"
            >
              <LayoutList size={16} />
            </button>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 transition"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {canWrite && (
            <button
              id="btn-upload-dokumen"
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md"
            >
              <Plus size={16} />
              Upload Dokumen
            </button>
          )}
        </div>
      </div>

      {/* ── Expiring Alert ── */}
      {expiring.length > 0 && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {expiring.length} dokumen akan kadaluarsa dalam 30 hari
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {expiring.map(d => d.judul).slice(0, 3).join(', ')}
              {expiring.length > 3 && ` dan ${expiring.length - 3} lainnya`}
            </p>
          </div>
        </div>
      )}

      {/* ── Success/Error Banner ── */}
      {deleteMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 animate-fadeIn">
          {deleteMsg}
        </div>
      )}
      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Statistics ── */}
      <StatistikDokumen stats={stats} loading={statsLoading} expiringCount={expiring.length} />

      {/* ── Filters ── */}
      <FilterDokumen filters={filters} onChange={updateFilters} />

      {/* ── Content ── */}
      {loading ? (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-64 animate-pulse bg-neutral-200 dark:bg-neutral-700" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <AlertTriangle size={40} className="mb-3 text-red-400" />
          <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-indigo-500 hover:underline">Coba lagi</button>
        </div>
      ) : dokumen.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Archive size={48} className="mb-4 opacity-30" />
          <p className="font-semibold text-neutral-500 dark:text-neutral-400">Belum ada dokumen</p>
          <p className="text-sm mt-1">
            {canWrite
              ? 'Klik "Upload Dokumen" untuk menambahkan dokumen pertama'
              : 'Belum ada dokumen yang tersedia'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dokumen.map(doc => (
            <KartuDokumen
              key={doc.id}
              dokumen={doc}
              canWrite={canWrite}
              onEdit={openEditForm}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {/* List header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            <span>Dokumen</span>
            <span>Kategori</span>
            <span>Tanggal Terbit</span>
            <span>Status</span>
            <span>Aksi</span>
          </div>
          {dokumen.map(doc => (
            <div
              key={doc.id}
              className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-start md:items-center px-4 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">{doc.judul}</p>
                {doc.nomorDokumen && <p className="text-xs text-neutral-400 mt-0.5">{doc.nomorDokumen}</p>}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {doc.kategori.replace('_', ' ')}
              </span>
              <span className="text-xs text-neutral-500">
                {doc.tanggalTerbit ? new Date(doc.tanggalTerbit).toLocaleDateString('id-ID') : '—'}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {doc.tingkatKerahasiaan && doc.tingkatKerahasiaan !== 'PUBLIK' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${KERAHASIAAN_COLOR[doc.tingkatKerahasiaan]}`}>
                    <span>{KERAHASIAAN_ICON[doc.tingkatKerahasiaan]}</span> {KERAHASIAAN_LABEL[doc.tingkatKerahasiaan]}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  doc.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' :
                  doc.status === 'kadaluarsa' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {doc.filePath && (
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                    title="Buka file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
                {canWrite && (
                  <>
                    <button
                      onClick={() => openEditForm(doc)}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => onDelete(doc.id, doc.judul)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">
            Menampilkan {((currentPage - 1) * (filters.limit ?? 12)) + 1}–{Math.min(currentPage * (filters.limit ?? 12), total)} dari {total} dokumen
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => updateFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <FormDokumen
          initialData={editTarget}
          onSubmit={onFormSubmit}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default HalamanArsipDokumen;
