
import { openDb } from '../../config/db';
import { CompanySettings } from './company-settings.model';

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const db = await openDb();
  return db.get('SELECT * FROM company_settings LIMIT 1');
};

export const updateCompanySettings = async (settings: CompanySettings): Promise<void> => {
  const db = await openDb();
  const { companyName, npwp, address, logo } = settings;
  await db.run('UPDATE company_settings SET companyName = ?, npwp = ?, address = ?, logo = ?', [companyName, npwp, address, logo]);
};
