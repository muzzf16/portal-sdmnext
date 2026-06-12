// src/features/11-arsip-dokumen/components/KartuDokumen.tsx
import React, { useState } from 'react';
import {
  FileText, Download, Pencil, Trash2, ExternalLink,
  Calendar, Building2, Tag, Hash, Clock,
} from 'lucide-react';
import {
  ArsipDokumen,
  KATEGORI_LABEL,
  KATEGORI_COLOR,
  STATUS_LABEL,
  STATUS_COLOR,
  KERAHASIAAN_LABEL,
  KERAHASIAAN_COLOR,
  KERAHASIAAN_ICON,
} from '../types';
import { normalizeAssetUrl } from '../../../shared/utils/normalizeAssetUrl';

interface Props {
  dokumen: ArsipDokumen;
  canWrite: boolean;
  onEdit: (doc: ArsipDokumen) => void;
  onDelete: (id: string, judul: string) => void;
}

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d?: string | null) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isExpiringSoon = (d?: string | null) => {
  if (!d) return false;
  const diff = new Date(d).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const KartuDokumen: React.FC<Props> = ({ dokumen, canWrite, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileUrl = dokumen.filePath ? normalizeAssetUrl(dokumen.filePath) : null;
  const expiringSoon = isExpiringSoon(dokumen.tanggalKadaluarsa);
  const fileSize = formatBytes(dokumen.ukuranFile);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400" />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug">
              {dokumen.judul}
            </h3>
            {dokumen.nomorDokumen && (
              <div className="flex items-center gap-1 mt-1">
                <Hash size={11} className="text-neutral-400 flex-shrink-0" />
                <span className="text-xs text-neutral-400 truncate">{dokumen.nomorDokumen}</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${KATEGORI_COLOR[dokumen.kategori]}`}>
              {KATEGORI_LABEL[dokumen.kategori]}
            </span>
            <div className="flex gap-1.5">
              {dokumen.tingkatKerahasiaan && dokumen.tingkatKerahasiaan !== 'PUBLIK' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${KERAHASIAAN_COLOR[dokumen.tingkatKerahasiaan]}`}>
                  <span>{KERAHASIAAN_ICON[dokumen.tingkatKerahasiaan]}</span>
                  {KERAHASIAAN_LABEL[dokumen.tingkatKerahasiaan]}
                </span>
              )}
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLOR[dokumen.status]}`}>
                {STATUS_LABEL[dokumen.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {dokumen.deskripsi && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {dokumen.deskripsi}
          </p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {dokumen.penerbit && (
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="flex-shrink-0" />
              <span className="truncate">{dokumen.penerbit}</span>
            </div>
          )}
          {dokumen.tanggalTerbit && (
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="flex-shrink-0" />
              <span>Terbit: {formatDate(dokumen.tanggalTerbit)}</span>
            </div>
          )}
          {dokumen.tanggalKadaluarsa && (
            <div className={`flex items-center gap-1.5 ${expiringSoon ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
              <Clock size={12} className="flex-shrink-0" />
              <span>
                Berlaku s/d: {formatDate(dokumen.tanggalKadaluarsa)}
                {expiringSoon && ' ⚠️'}
              </span>
            </div>
          )}
          {fileSize && (
            <div className="flex items-center gap-1.5">
              <FileText size={12} className="flex-shrink-0" />
              <span>{dokumen.tipeFile?.split('/')[1]?.toUpperCase() ?? 'File'} • {fileSize}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {dokumen.tags && dokumen.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag size={11} className="text-neutral-400 flex-shrink-0" />
            {dokumen.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="inline-flex px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
            {dokumen.tags.length > 4 && (
              <span className="text-[10px] text-neutral-400">+{dokumen.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700">
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
            >
              <ExternalLink size={13} />
              Buka
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 cursor-not-allowed">
              <FileText size={13} />
              Tidak ada file
            </div>
          )}

          {fileUrl && (
            <a
              href={fileUrl}
              download
              className="p-2 rounded-xl text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
              title="Download"
            >
              <Download size={15} />
            </a>
          )}

          {canWrite && (
            <>
              <button
                onClick={() => onEdit(dokumen)}
                className="p-2 rounded-xl text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                title="Edit dokumen"
                id={`btn-edit-${dokumen.id}`}
              >
                <Pencil size={15} />
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Hapus dokumen"
                  id={`btn-delete-${dokumen.id}`}
                >
                  <Trash2 size={15} />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => onDelete(dokumen.id, dokumen.judul)}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg text-[10px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
                  >
                    Batal
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KartuDokumen;
