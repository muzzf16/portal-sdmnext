import api from '../../../shared/services/api';
import { Pelatihan } from '../types';

// The training API in the backend returns data with Indonesian field names
// but this module expects English field names, so we need to handle the mapping in the hook
export const getPelatihan = () => api.get('/pelatihan');
