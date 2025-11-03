import api from '../../../shared/services/api';
import { Kontrak } from '../types';

export const getKontrak = () => api.get<Kontrak[]>('/contracts');
export const getKontrakById = (id: string) => api.get<Kontrak>(`/contracts/${id}`);

export const buatKontrak = (kontrakData: Omit<Kontrak, 'id' | 'createdAt' | 'contractFile' | 'notes'> & { notes?: string }) => api.post<Kontrak>('/contracts', kontrakData);

// API function that handles FormData for file uploads
export const buatKontrakWithFile = (formData: FormData) => api.post<Kontrak>('/contracts', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
