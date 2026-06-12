// src/modules/arsip-dokumen/arsip-dokumen.model.ts

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

/** Role yang bisa melihat dokumen RAHASIA dan SANGAT_RAHASIA */
export const RAHASIA_ALLOWED_ROLES = ['admin', 'pimpinan', 'supervisor'] as const;

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

export interface CreateArsipDokumenDto {
  judul: string;
  kategori: KategoriDokumen;
  nomorDokumen?: string;
  tanggalTerbit?: string;
  tanggalBerlaku?: string;
  tanggalKadaluarsa?: string;
  penerbit?: string;
  deskripsi?: string;
  tags?: string[];
  status?: StatusDokumen;
  tingkatKerahasiaan?: TingkatKerahasiaan;
  uploadedBy?: string;
}

export interface UpdateArsipDokumenDto extends Partial<CreateArsipDokumenDto> {}

export interface ArsipDokumenFilters {
  kategori?: KategoriDokumen;
  status?: StatusDokumen;
  tingkatKerahasiaan?: TingkatKerahasiaan;
  search?: string;
  tanggalDari?: string;
  tanggalSampai?: string;
  page?: number;
  limit?: number;
  /** Role pengguna yang mengakses — digunakan backend untuk filter kerahasiaan */
  _userRole?: string;
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
