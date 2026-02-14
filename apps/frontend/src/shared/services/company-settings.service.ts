
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE || 'http://localhost:3333'}/api/company-settings`;

export const getCompanySettings = () => {
  return axios.get(BASE_URL);
};

export const updateCompanySettings = (data: any, logoFile?: File | null) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  if (logoFile) {
    formData.append('logo', logoFile);
  }

  return axios.put(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
