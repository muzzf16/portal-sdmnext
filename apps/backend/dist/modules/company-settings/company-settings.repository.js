"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySettings = exports.getCompanySettings = void 0;
const db_1 = require("../../config/db");
const getCompanySettings = async () => {
    const db = await (0, db_1.openDb)();
    return db.get('SELECT * FROM company_settings LIMIT 1');
};
exports.getCompanySettings = getCompanySettings;
const updateCompanySettings = async (settings) => {
    const db = await (0, db_1.openDb)();
    const { companyName, npwp, address, logo, workStartTime, workEndTime, lateToleranceMinutes, annualLeaveQuota, sickLeaveQuota, maternityLeaveQuota, personalLeaveQuota, carryOverPolicy, probationMonths, bankName, bankAccountNumber, payrollDate, overtimeMultiplier, thrPolicy } = settings;
    await db.run(`UPDATE company_settings SET 
      companyName = ?, npwp = ?, address = ?, logo = ?,
      workStartTime = ?, workEndTime = ?, lateToleranceMinutes = ?,
      annualLeaveQuota = ?, sickLeaveQuota = ?,
      maternityLeaveQuota = ?, personalLeaveQuota = ?,
      carryOverPolicy = ?, probationMonths = ?,
      bankName = ?, bankAccountNumber = ?, payrollDate = ?,
      overtimeMultiplier = ?, thrPolicy = ?`, [
        companyName, npwp, address, logo,
        workStartTime || '08:00', workEndTime || '17:00', lateToleranceMinutes || 15,
        annualLeaveQuota || 12, sickLeaveQuota || 14,
        maternityLeaveQuota || 90, personalLeaveQuota || 3,
        carryOverPolicy || 'none', probationMonths || 12,
        bankName || '', bankAccountNumber || '', payrollDate || 25,
        overtimeMultiplier || 1.5, thrPolicy || 'prorata'
    ]);
};
exports.updateCompanySettings = updateCompanySettings;
//# sourceMappingURL=company-settings.repository.js.map