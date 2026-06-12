// src/features/11-arsip-dokumen/components/FormDokumen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Tag, Plus, Loader2 } from 'lucide-react';
import {
  ArsipDokumen,
  KategoriDokumen,
  StatusDokumen,
  TingkatKerahasiaan,
  KATEGORI_LABEL,
  STATUS_LABEL,
  KERAHASIAAN_LABEL,
} from '../types';

interface Props {
  initialData?: ArsipDokumen | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const KATEGORI_OPTIONS: KategoriDokumen[] = [
  'SK_DIREKSI', 'NOTULEN_RAPAT', 'NIB', 'SOP',
  'PERATURAN', 'PERJANJIAN', 'LEGALITAS', 'LAINNYA',
];
const STATUS_OPTIONS: StatusDokumen[] = ['aktif', 'kadaluarsa', 'dicabut'];
const KERAHASIAAN_OPTIONS: TingkatKerahasiaan[] = ['PUBLIK', 'INTERNAL', 'RAHASIA', 'SANGAT_RAHASIA'];

const InputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition';

const LabelClass = 'block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1';

const FormDokumen: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    judul: initialData?.judul ?? '',
    kategori: initialData?.kategori ?? ('' as KategoriDokumen | ''),
    nomorDokumen: initialData?.nomorDokumen ?? '',
    tanggalTerbit: initialData?.tanggalTerbit ?? '',
    tanggalBerlaku: initialData?.tanggalBerlaku ?? '',
    tanggalKadaluarsa: initialData?.tanggalKadaluarsa ?? '',
    penerbit: initialData?.penerbit ?? '',
    deskripsi: initialData?.deskripsi ?? '',
    status: initialData?.status ?? ('aktif' as StatusDokumen),
    tingkatKerahasiaan: initialData?.tingkatKerahasiaan ?? ('PUBLIK' as TingkatKerahasiaan),
  });
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        judul: initialData.judul,
        kategori: initialData.kategori,
        nomorDokumen: initialData.nomorDokumen ?? '',
        tanggalTerbit: initialData.tanggalTerbit ?? '',
        tanggalBerlaku: initialData.tanggalBerlaku ?? '',
        tanggalKadaluarsa: initialData.tanggalKadaluarsa ?? '',
        penerbit: initialData.penerbit ?? '',
        deskripsi: initialData.deskripsi ?? '',
        status: initialData.status,
        tingkatKerahasiaan: initialData.tingkatKerahasiaan,
      });
      setTags(initialData.tags ?? []);
    }
  }, [initialData]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 20 MB');
      return;
    }
    setFileError('');
    setFile(f);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.judul.trim()) errs.judul = 'Judul wajib diisi';
    if (!form.kategori) errs.kategori = 'Kategori wajib dipilih';
    if (!isEdit && !file) errs.file = 'File dokumen wajib diunggah';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v as string);
      });
      fd.append('tags', JSON.stringify(tags));
      if (file) fd.append('file', file);

      await onSubmit(fd);
    } catch (err: any) {
      setErrors({ _: err?.response?.data?.message ?? 'Terjadi kesalahan' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-700">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {isEdit ? 'Edit Dokumen' : 'Upload Dokumen Baru'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEdit ? 'Perbarui metadata dokumen' : 'Tambahkan dokumen ke arsip perusahaan'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Global error */}
          {errors._ && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {errors._}
            </div>
          )}

          {/* Judul */}
          <div>
            <label htmlFor="form-judul" className={LabelClass}>Judul Dokumen <span className="text-red-500">*</span></label>
            <input id="form-judul" type="text" placeholder="cth. SK Direksi No. 001/2026" value={form.judul} onChange={set('judul')} className={InputClass} />
            {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-kategori" className={LabelClass}>Kategori <span className="text-red-500">*</span></label>
              <select id="form-kategori" value={form.kategori} onChange={set('kategori')} className={InputClass}>
                <option value="">-- Pilih Kategori --</option>
                {KATEGORI_OPTIONS.map(k => (
                  <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>
                ))}
              </select>
              {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori}</p>}
            </div>
            <div>
              <label htmlFor="form-status" className={LabelClass}>Status</label>
              <select id="form-status" value={form.status} onChange={set('status')} className={InputClass}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="form-kerahasiaan" className={LabelClass}>Kerahasiaan <span className="text-red-500">*</span></label>
              <select id="form-kerahasiaan" value={form.tingkatKerahasiaan} onChange={set('tingkatKerahasiaan')} className={InputClass}>
                {KERAHASIAAN_OPTIONS.map(k => (
                  <option key={k} value={k}>{KERAHASIAAN_LABEL[k]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nomor & Penerbit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-nomor" className={LabelClass}>Nomor Dokumen</label>
              <input id="form-nomor" type="text" placeholder="cth. 001/SK/DIR/2026" value={form.nomorDokumen} onChange={set('nomorDokumen')} className={InputClass} />
            </div>
            <div>
              <label htmlFor="form-penerbit" className={LabelClass}>Penerbit</label>
              <input id="form-penerbit" type="text" placeholder="cth. Direktur Utama" value={form.penerbit} onChange={set('penerbit')} className={InputClass} />
            </div>
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="form-terbit" className={LabelClass}>Tanggal Terbit</label>
              <input id="form-terbit" type="date" value={form.tanggalTerbit} onChange={set('tanggalTerbit')} className={InputClass} />
            </div>
            <div>
              <label htmlFor="form-berlaku" className={LabelClass}>Tanggal Berlaku</label>
              <input id="form-berlaku" type="date" value={form.tanggalBerlaku} onChange={set('tanggalBerlaku')} className={InputClass} />
            </div>
            <div>
              <label htmlFor="form-kadaluarsa" className={LabelClass}>Tanggal Kadaluarsa</label>
              <input id="form-kadaluarsa" type="date" value={form.tanggalKadaluarsa} onChange={set('tanggalKadaluarsa')} className={InputClass} />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="form-deskripsi" className={LabelClass}>Deskripsi</label>
            <textarea
              id="form-deskripsi"
              rows={3}
              placeholder="Ringkasan isi atau tujuan dokumen..."
              value={form.deskripsi}
              onChange={set('deskripsi')}
              className={`${InputClass} resize-none`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={LabelClass}><Tag size={11} className="inline mr-1" />Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-indigo-500 hover:text-red-500 transition">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="form-tag-input"
                type="text"
                placeholder="Ketik tag lalu Enter atau klik +"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className={`${InputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addTag}
                className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={LabelClass}>
              <FileText size={11} className="inline mr-1" />
              File Dokumen {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="font-normal text-neutral-400 ml-1">(kosongkan jika tidak diganti)</span>}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition
                ${file
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10'
                  : 'border-neutral-200 dark:border-neutral-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                }`}
            >
              <Upload size={24} className={file ? 'text-indigo-500' : 'text-neutral-400'} />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{file.name}</p>
                  <p className="text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Klik untuk pilih file</p>
                  <p className="text-xs text-neutral-400">PDF, DOC, DOCX, XLS, JPG, PNG • Maks. 20 MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="form-file"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
            {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
            {isEdit && initialData?.filePath && !file && (
              <p className="text-xs text-neutral-400 mt-1">
                File saat ini: <span className="text-indigo-500">{initialData.filePath.split('/').pop()}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="btn-submit-dokumen"
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><Upload size={15} /> {isEdit ? 'Simpan Perubahan' : 'Upload Dokumen'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDokumen;
