
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
  },
  restoreFromUpload: async (file: File) => {
    const formData = new FormData();
    formData.append('backup', file);
    const response = await api.post('/backup/restore-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  download: async (filename: string) => {
    const response = await api.get(`/backup/download/${filename}`, {
      responseType: 'blob'
    });
    
    // Create a temporary link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
