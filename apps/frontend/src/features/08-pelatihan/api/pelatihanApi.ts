import api from '../../../shared/services/api';
import { Pelatihan } from '../types';

export const getPelatihan = () => api.get<Pelatihan[]>('/pelatihan');
