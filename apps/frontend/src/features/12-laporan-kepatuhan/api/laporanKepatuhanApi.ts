import api from '../../../shared/services/api';
import { ApiResponse } from '../../../shared/services/apiService';
import { LaporanKepatuhanItem, CreateLaporanKepatuhanPayload, UpdateLaporanKepatuhanPayload } from '../types';

const API_BASE = '/laporan-kepatuhan';

function normalizeResponse<T>(responseData: any): ApiResponse<T> {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData as ApiResponse<T>;
  }
  return { success: true, data: responseData, message: undefined, meta: undefined } as ApiResponse<T>;
}

export const getAllLaporan = async (employeeId?: string) => {
  const params = employeeId ? { employee_id: employeeId } : undefined;
  const response = await api.get<LaporanKepatuhanItem[]>(API_BASE, { params });
  return normalizeResponse<LaporanKepatuhanItem[]>(response.data);
};

export const getMyLaporan = async () => {
  const response = await api.get<LaporanKepatuhanItem[]>(`${API_BASE}/my-reports`);
  return normalizeResponse<LaporanKepatuhanItem[]>(response.data);
};

export const createLaporan = async (payload: CreateLaporanKepatuhanPayload) => {
  const response = await api.post<LaporanKepatuhanItem>(API_BASE, payload);
  return normalizeResponse<LaporanKepatuhanItem>(response.data);
};

export const updateLaporan = async (id: number, payload: UpdateLaporanKepatuhanPayload) => {
  let response;
  
  if (payload.lampiran instanceof File) {
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] !== undefined) {
        formData.append(key, payload[key as keyof typeof payload] as any);
      }
    });
    response = await api.put<LaporanKepatuhanItem>(`${API_BASE}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    response = await api.put<LaporanKepatuhanItem>(`${API_BASE}/${id}`, payload);
  }
  
  return normalizeResponse<LaporanKepatuhanItem>(response.data);
};

export const deleteLaporan = async (id: number) => {
  const response = await api.delete(`${API_BASE}/${id}`);
  return normalizeResponse<{id: number}>(response.data);
};

export const uploadExcelLaporan = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ imported: number }>(`${API_BASE}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeResponse<{ imported: number }>(response.data);
};
