import api from '../../../shared/services/api';
import { Kontrak } from '../types';

export const getKontrak = () => api.get<Kontrak[]>('/contracts');
export const getKontrakById = (id: string) => api.get<Kontrak>(`/contracts/${id}`);
export const buatKontrak = (kontrakData: Omit<Kontrak, 'id'>) => api.post<Kontrak>('/contracts', kontrakData);
