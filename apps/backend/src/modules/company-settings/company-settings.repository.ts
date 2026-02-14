
import { openDb } from '../../config/db';
import { CompanySettings } from './company-settings.model';

export const getCompanySettings = async (): Promise<CompanySettings | undefined> => {
  const db = await openDb();
  return db.get('SELECT * FROM company_settings LIMIT 1');
};

export const updateCompanySettings = async (settings: CompanySettings): Promise<void> => {
  const db = await openDb();
  const {
    companyName, npwp, address, logo,
    workStartTime, workEndTime, lateToleranceMinutes,
    annualLeaveQuota, sickLeaveQuota,
    bankName, bankAccountNumber, payrollDate
  } = settings;

  await db.run(
    `UPDATE company_settings SET 
      companyName = ?, npwp = ?, address = ?, logo = ?,
      workStartTime = ?, workEndTime = ?, lateToleranceMinutes = ?,
      annualLeaveQuota = ?, sickLeaveQuota = ?,
      bankName = ?, bankAccountNumber = ?, payrollDate = ?`,
    [
      companyName, npwp, address, logo,
      workStartTime || '08:00', workEndTime || '17:00', lateToleranceMinutes || 15,
      annualLeaveQuota || 12, sickLeaveQuota || 14,
      bankName || '', bankAccountNumber || '', payrollDate || 25
    ]
  );
};
