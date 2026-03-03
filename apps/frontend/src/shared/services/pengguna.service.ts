
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE || ''}/api/users`;

const getAllPengguna = () => {
  return axios.get(BASE_URL);
};

const getPenggunaById = (id: string) => {
  return axios.get(`${BASE_URL}/${id}`);
};

const createPengguna = (data: any) => {
  return axios.post(BASE_URL, data);
};

const updatePengguna = (id: string, data: any) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

const deletePengguna = (id: string) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export default {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
};
