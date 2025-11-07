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
    const { companyName, npwp, address, logo } = settings;
    await db.run('UPDATE company_settings SET companyName = ?, npwp = ?, address = ?, logo = ?', [companyName, npwp, address, logo]);
};
exports.updateCompanySettings = updateCompanySettings;
//# sourceMappingURL=company-settings.repository.js.map