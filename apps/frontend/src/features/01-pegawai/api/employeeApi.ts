import api from '../../../shared/services/api';
import { ApiResponse } from '../../../shared/services/apiService';
import { Pegawai } from '../types';

// API functions that can handle both raw and standardized responses
const API_BASE = '/employees';

export const getPegawai = async () => {
  try {
    const response = await api.get<Pegawai[]>(API_BASE);
    // Handle both standardized response format and raw response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Response is in standardized format
      return response.data as ApiResponse<Pegawai[]>;
    } else {
      // Response is raw data
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai[]>;
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getPegawaiById = async (id: string) => {
  try {
    const response = await api.get<Pegawai>(`${API_BASE}/${id}`);
    // Handle both standardized response format and raw response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Response is in standardized format
      return response.data as ApiResponse<Pegawai>;
    } else {
      // Response is raw data
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createPegawai = async (pegawai: Omit<Pegawai, 'id'>) => {
  try {
    const response = await api.post<Pegawai>(API_BASE, pegawai);
    // Handle both standardized response format and raw response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Response is in standardized format
      return response.data as ApiResponse<Pegawai>;
    } else {
      // Response is raw data
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updatePegawai = async (id: string, pegawai: Partial<Pegawai>) => {
  try {
    const response = await api.put<Pegawai>(`${API_BASE}/${id}`, pegawai);
    // Handle both standardized response format and raw response
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Response is in standardized format
      return response.data as ApiResponse<Pegawai>;
    } else {
      // Response is raw data
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
};

export const deletePegawai = async (id: string) => {
  try {
    const response = await api.delete(`${API_BASE}/${id}`);
    // For delete, we return a standardized success response
    return { success: true, data: true, message: 'Employee deleted successfully', meta: undefined } as ApiResponse<boolean>;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
};
