
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE || ''}/api/backup`;

export const backupDatabase = () => {
  return axios.post(`${BASE_URL}/backup`);
};

export const restoreDatabase = () => {
  return axios.post(`${BASE_URL}/restore`);
};
