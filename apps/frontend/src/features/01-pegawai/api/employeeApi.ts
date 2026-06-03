import api from '../../../shared/services/api';
import { ApiResponse } from '../../../shared/services/apiService';
import { Pegawai } from '../types';

const API_BASE = '/employees';

// Shared helper to build FormData from pegawai data + optional photo
function buildFormData(pegawai: Partial<Pegawai>, photo?: File): FormData {
  const formData = new FormData();
  const fieldsToStringify = ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo'];

  Object.entries(pegawai).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (fieldsToStringify.includes(key) && typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  if (photo) {
    formData.append('photo', photo);
  }

  return formData;
}

// Shared helper to normalize API response
function normalizeResponse<T>(responseData: any): ApiResponse<T> {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData as ApiResponse<T>;
  }
  return { success: true, data: responseData, message: undefined, meta: undefined } as ApiResponse<T>;
}

export const getPegawai = async (params?: { includeDirectors?: boolean }) => {
  try {
    const response = await api.get<Pegawai[]>(API_BASE, { params });
    return normalizeResponse<Pegawai[]>(response.data);
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getPegawaiById = async (id: string) => {
  try {
    const response = await api.get<Pegawai>(`${API_BASE}/${id}`);
    return normalizeResponse<Pegawai>(response.data);
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createPegawai = async (pegawai: Omit<Pegawai, 'id'>, photo?: File) => {
  try {
    const formData = buildFormData(pegawai, photo);
    const response = await api.post<Pegawai>(API_BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeResponse<Pegawai>(response.data);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updatePegawai = async (id: string, pegawai: Partial<Pegawai>, photo?: File) => {
  try {
    const formData = buildFormData(pegawai, photo);
    const response = await api.put<Pegawai>(`${API_BASE}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeResponse<Pegawai>(response.data);
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
};

export const deletePegawai = async (id: string) => {
  try {
    await api.delete(`${API_BASE}/${id}`);
    return { success: true, data: true, message: 'Employee deleted successfully', meta: undefined } as ApiResponse<boolean>;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
};

export const createPegawaiWithUser = async (pegawai: Omit<Pegawai, 'id'>, photo?: File) => {
  try {
    const formData = buildFormData(pegawai, photo);
    const response = await api.post<Pegawai>(`${API_BASE}/with-user`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeResponse<Pegawai>(response.data);
  } catch (error) {
    console.error('Error creating employee with user:', error);
    throw error;
  }
};