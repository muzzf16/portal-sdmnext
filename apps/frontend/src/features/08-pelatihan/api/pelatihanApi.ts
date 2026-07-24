import api from '../../../shared/services/api';

export const getPelatihan = () => api.get('/pelatihan');
export const getPelatihanByEmployeeId = (employeeId: string) => api.get(`/pelatihan/employee/${employeeId}`);
export const addPelatihan = (employeeId: string, data: FormData) => api.post(`/pelatihan/employee/${employeeId}`, data);
export const addPelatihanGeneral = (data: FormData) => api.post('/pelatihan', data);
export const updatePelatihan = (id: number | string, data: FormData) => api.put(`/pelatihan/${id}`, data);
export const deletePelatihan = (id: number | string) => api.delete(`/pelatihan/${id}`);
