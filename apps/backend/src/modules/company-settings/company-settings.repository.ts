
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
    annualLeaveQuota, sickLeaveQuota, maternityLeaveQuota, personalLeaveQuota,
    carryOverPolicy, probationMonths,
    bankName, bankAccountNumber, payrollDate, overtimeMultiplier, thrPolicy
  } = settings;

  await db.run(
    `UPDATE company_settings SET 
      companyName = ?, npwp = ?, address = ?, logo = ?,
      workStartTime = ?, workEndTime = ?, lateToleranceMinutes = ?,
      annualLeaveQuota = ?, sickLeaveQuota = ?,
      maternityLeaveQuota = ?, personalLeaveQuota = ?,
      carryOverPolicy = ?, probationMonths = ?,
      bankName = ?, bankAccountNumber = ?, payrollDate = ?,
      overtimeMultiplier = ?, thrPolicy = ?`,
    [
      companyName, npwp, address, logo,
      workStartTime || '08:00', workEndTime || '17:00', lateToleranceMinutes || 15,
      annualLeaveQuota || 12, sickLeaveQuota || 14,
      maternityLeaveQuota || 90, personalLeaveQuota || 3,
      carryOverPolicy || 'none', probationMonths || 12,
      bankName || '', bankAccountNumber || '', payrollDate || 25,
      overtimeMultiplier || 1.5, thrPolicy || 'prorata'
    ]
  );
};
