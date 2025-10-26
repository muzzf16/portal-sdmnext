import api from '../../../shared/services/api';
import { Lamaran } from '../types';

export const getLamaran = () => api.get<Lamaran[]>('/recruitment/candidates');
export const buatLamaran = (lamaranData: Omit<Lamaran, 'id'>) => api.post<Lamaran>('/recruitment/candidates', lamaranData);
