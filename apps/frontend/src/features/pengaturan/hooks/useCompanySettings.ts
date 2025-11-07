
import { useQuery } from '@tanstack/react-query';
import { getCompanySettings } from '../api/company-settings.api';

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings,
  });
};
