
import api from '../../../shared/services/api';
import { CompanySettings } from '../types';

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const response = await api.get('/company-settings');
  return response.data;
};
