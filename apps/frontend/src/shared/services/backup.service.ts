
import axios from 'axios';

const API_URL = '/api/backup';

export const backupDatabase = () => {
  return axios.post(`${API_URL}/backup`);
};

export const restoreDatabase = () => {
  return axios.post(`${API_URL}/restore`);
};
