
import { getCompanySettings, updateCompanySettings } from './company-settings.repository';
import { CompanySettings } from './company-settings.model';

export const getSettings = async (): Promise<CompanySettings> => {
  return getCompanySettings();
};

export const updateSettings = async (settings: CompanySettings): Promise<void> => {
  return updateCompanySettings(settings);
};
