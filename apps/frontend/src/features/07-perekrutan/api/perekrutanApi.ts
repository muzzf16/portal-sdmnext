import api from '../../../shared/services/api';
import { Kandidat } from '../types';

export const getKandidat = async () => {
  const response = await api.get<Kandidat[]>('/recruitment/candidates');
  return response.data;
};

export const getKandidatById = async (id: number) => {
  const response = await api.get<Kandidat>(`/recruitment/candidates/${id}`);
  return response.data;
};

export const buatKandidat = async (data: Omit<Kandidat, 'id' | 'created_at'>) => {
  const response = await api.post<Kandidat>('/recruitment/candidates', data);
  return response.data;
};

export const perbaruiKandidat = async (id: number, data: Partial<Kandidat>) => {
  const response = await api.put<Kandidat>(`/recruitment/candidates/${id}`, data);
  return response.data;
};

export const hapusKandidat = async (id: number) => {
  const response = await api.delete(`/recruitment/candidates/${id}`);
  return response.data;
};
