
import api from './api';

export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

export const backupAPI = {
  list: async () => {
    const response = await api.get('/backup/list');
    return response.data;
  },
  create: async () => {
    const response = await api.post('/backup/backup');
    return response.data;
  },
  restore: async (filename: string) => {
    const response = await api.post('/backup/restore', { filename });
    return response.data;
  }
};
