
import axios from 'axios';

const API_URL = '/api/company-settings';

export const getCompanySettings = () => {
  return axios.get(API_URL);
};

export const updateCompanySettings = (data: any, logoFile?: File | null) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });

  if (logoFile) {
    formData.append('logo', logoFile);
  }

  return axios.put(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
