// src/features/11-arsip-dokumen/api/arsipDokumenApi.ts
import api from '../../../shared/services/api';
import {
  ArsipDokumen,
  ArsipDokumenFilters,
  ArsipDokumenListResponse,
  ArsipDokumenStats,
} from '../types';

const BASE = '/arsip-dokumen';

/** Ambil daftar dokumen dengan filter & pagination */
export const getArsipDokumen = (filters?: ArsipDokumenFilters) =>
  api.get<ArsipDokumenListResponse>(BASE, { params: filters });

/** Statistik dokumen */
export const getArsipDokumenStats = () =>
  api.get<{ success: boolean; data: ArsipDokumenStats }>(`${BASE}/stats`);

/** Dokumen yang akan kadaluarsa */
export const getArsipDokumenExpiring = (days?: number) =>
  api.get<{ success: boolean; data: ArsipDokumen[] }>(`${BASE}/expiring`, {
    params: days ? { days } : {},
  });

/** Detail satu dokumen */
export const getArsipDokumenById = (id: string) =>
  api.get<{ success: boolean; data: ArsipDokumen }>(`${BASE}/${id}`);

/** Upload dokumen baru (multipart/form-data) */
export const createArsipDokumen = (formData: FormData) =>
  api.post<{ success: boolean; data: ArsipDokumen; message: string }>(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Update metadata/file dokumen */
export const updateArsipDokumen = (id: string, formData: FormData) =>
  api.put<{ success: boolean; data: ArsipDokumen; message: string }>(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Hapus dokumen */
export const deleteArsipDokumen = (id: string) =>
  api.delete<{ success: boolean; message: string }>(`${BASE}/${id}`);
