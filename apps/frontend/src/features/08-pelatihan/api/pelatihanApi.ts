import api from '../../../shared/services/api';

// The training API in the backend returns data with Indonesian field names
// but this module expects English field names, so we need to handle the mapping in the hook
export const getPelatihan = () => api.get('/pelatihan');
export const getPelatihanByEmployeeId = (employeeId: string) => api.get(`/pelatihan/employee/${employeeId}`);
export const addPelatihan = (employeeId: string, data: FormData) => api.post(`/pelatihan/employee/${employeeId}`, data);
