import api from '../../../shared/services/api';
import { ApiResponse } from '../../../shared/services/apiService';
import { Pegawai } from '../types';

const API_BASE = '/employees';

export const getPegawai = async () => {
  try {
    const response = await api.get<Pegawai[]>(API_BASE);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as unknown as ApiResponse<Pegawai[]>;
    } else {
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
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as unknown as ApiResponse<Pegawai>;
    } else {
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createPegawai = async (pegawai: Omit<Pegawai, 'id'>, photo?: File) => {
  try {
    const formData = new FormData();
    
    Object.entries(pegawai).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'educationHistory' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    if (photo) {
      formData.append('photo', photo);
    }
    
    const response = await api.post<Pegawai>(API_BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as unknown as ApiResponse<Pegawai>;
    } else {
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updatePegawai = async (id: string, pegawai: Partial<Pegawai>, photo?: File) => {
  try {
    const formData = new FormData();
    
    Object.entries(pegawai).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'educationHistory' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    if (photo) {
      formData.append('photo', photo);
    }
    
    const response = await api.put<Pegawai>(`${API_BASE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as unknown as ApiResponse<Pegawai>;
    } else {
      return { success: true, data: response.data, message: undefined, meta: undefined } as ApiResponse<Pegawai>;
    }
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