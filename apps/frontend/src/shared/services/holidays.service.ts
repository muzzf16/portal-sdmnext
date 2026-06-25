import api from './api';

export interface HolidayData {
  id: string;
  tanggal: string;
  deskripsi: string;
}

export const getHolidays = async () => {
  const response = await api.get('/holidays');
  return response.data;
};

export const createHoliday = async (data: Omit<HolidayData, 'id'>) => {
  const response = await api.post('/holidays', data);
  return response.data;
};

export const updateHoliday = async (id: string, data: Omit<HolidayData, 'id'>) => {
  const response = await api.put(`/holidays/${id}`, data);
  return response.data;
};

export const deleteHoliday = async (id: string) => {
  const response = await api.delete(`/holidays/${id}`);
  return response.data;
};
