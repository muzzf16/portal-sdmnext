// src/features/11-arsip-dokumen/types/index.ts

export type KategoriDokumen =
  | 'SK_DIREKSI'
  | 'NOTULEN_RAPAT'
  | 'NIB'
  | 'SOP'
  | 'PERATURAN'
  | 'PERJANJIAN'
  | 'LEGALITAS'
  | 'LAINNYA';

export type TingkatKerahasiaan = 'PUBLIK' | 'INTERNAL' | 'RAHASIA' | 'SANGAT_RAHASIA';

export type StatusDokumen = 'aktif' | 'kadaluarsa' | 'dicabut';

export interface ArsipDokumen {
  id: string;
  judul: string;
  kategori: KategoriDokumen;
  nomorDokumen?: string | null;
  tanggalTerbit?: string | null;
  tanggalBerlaku?: string | null;
  tanggalKadaluarsa?: string | null;
  penerbit?: string | null;
  deskripsi?: string | null;
  filePath?: string | null;
  ukuranFile?: number | null;
  tipeFile?: string | null;
  tags: string[];
  status: StatusDokumen;
  tingkatKerahasiaan: TingkatKerahasiaan;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArsipDokumenFilters {
  kategori?: KategoriDokumen | '';
  status?: StatusDokumen | '';
  tingkatKerahasiaan?: TingkatKerahasiaan | '';
  search?: string;
  tanggalDari?: string;
  tanggalSampai?: string;
  page?: number;
  limit?: number;
}

export interface ArsipDokumenListResponse {
  success: boolean;
  data: ArsipDokumen[];
  total: number;
  page: number;
  limit: number;
}

export interface ArsipDokumenStats {
  byKategori: { kategori: KategoriDokumen; jumlah: number }[];
  byStatus: { status: StatusDokumen; jumlah: number }[];
  expiringIn30Days: number;
}

export const KATEGORI_LABEL: Record<KategoriDokumen, string> = {
  SK_DIREKSI: 'SK Direksi',
  NOTULEN_RAPAT: 'Notulen Rapat',
  NIB: 'NIB',
  SOP: 'SOP',
  PERATURAN: 'Peraturan Perusahaan',
  PERJANJIAN: 'Perjanjian / MOU',
  LEGALITAS: 'Dokumen Legalitas',
  LAINNYA: 'Lainnya',
};

export const STATUS_LABEL: Record<StatusDokumen, string> = {
  aktif: 'Aktif',
  kadaluarsa: 'Kadaluarsa',
  dicabut: 'Dicabut',
};

export const KATEGORI_COLOR: Record<KategoriDokumen, string> = {
  SK_DIREKSI: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  NOTULEN_RAPAT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  NIB: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  SOP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  PERATURAN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  PERJANJIAN: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  LEGALITAS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  LAINNYA: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

export const STATUS_COLOR: Record<StatusDokumen, string> = {
  aktif: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  kadaluarsa: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  dicabut: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const KERAHASIAAN_LABEL: Record<TingkatKerahasiaan, string> = {
  PUBLIK: 'Publik',
  INTERNAL: 'Internal',
  RAHASIA: 'Rahasia',
  SANGAT_RAHASIA: 'Sangat Rahasia',
};

export const KERAHASIAAN_COLOR: Record<TingkatKerahasiaan, string> = {
  PUBLIK: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INTERNAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RAHASIA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  SANGAT_RAHASIA: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300 font-bold',
};

/** Icon/emoji per tingkat */
export const KERAHASIAAN_ICON: Record<TingkatKerahasiaan, string> = {
  PUBLIK: '🌐',
  INTERNAL: '🏢',
  RAHASIA: '🔒',
  SANGAT_RAHASIA: '🔴',
};

/** Role yang bisa melihat dokumen RAHASIA/SANGAT_RAHASIA */
export const RAHASIA_ALLOWED_ROLES = ['admin', 'pimpinan', 'supervisor'] as const;

