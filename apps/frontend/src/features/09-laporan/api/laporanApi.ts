import api from '../../../shared/services/api';
import { Laporan } from '../types';

export const getLaporan = () => api.get<Laporan[]>('/laporan');
