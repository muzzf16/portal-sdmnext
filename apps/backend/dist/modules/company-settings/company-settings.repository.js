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
    const { companyName, npwp, address, logo, workStartTime, workEndTime, lateToleranceMinutes, annualLeaveQuota, sickLeaveQuota, bankName, bankAccountNumber, payrollDate } = settings;
    await db.run(`UPDATE company_settings SET 
      companyName = ?, npwp = ?, address = ?, logo = ?,
      workStartTime = ?, workEndTime = ?, lateToleranceMinutes = ?,
      annualLeaveQuota = ?, sickLeaveQuota = ?,
      bankName = ?, bankAccountNumber = ?, payrollDate = ?`, [
        companyName, npwp, address, logo,
        workStartTime || '08:00', workEndTime || '17:00', lateToleranceMinutes || 15,
        annualLeaveQuota || 12, sickLeaveQuota || 14,
        bankName || '', bankAccountNumber || '', payrollDate || 25
    ]);
};
exports.updateCompanySettings = updateCompanySettings;
//# sourceMappingURL=company-settings.repository.js.map