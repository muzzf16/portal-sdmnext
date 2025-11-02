
import axios from 'axios';

const API_URL = '/api/users';

const getAllPengguna = () => {
  return axios.get(API_URL);
};

const getPenggunaById = (id: string) => {
  return axios.get(`${API_URL}/${id}`);
};

const createPengguna = (data: any) => {
  return axios.post(API_URL, data);
};

const updatePengguna = (id: string, data: any) => {
  return axios.put(`${API_URL}/${id}`, data);
};

const deletePengguna = (id: string) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
};
