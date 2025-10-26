import api from './api';
import { Kandidat } from '../types/types';

export const getKandidat = () => api.get<Kandidat[]>('/perekrutan');
export const getKandidatById = (id: number) => api.get<Kandidat>(`/perekrutan/${id}`);
export const buatKandidat = (data: Omit<Kandidat, 'id'>) => api.post<Kandidat>('/perekrutan', data);
export const perbaruiKandidat = (id: number, data: Partial<Kandidat>) => api.put<Kandidat>(`/perekrutan/${id}`, data);
export const hapusKandidat = (id: number) => api.delete(`/perekrutan/${id}`);