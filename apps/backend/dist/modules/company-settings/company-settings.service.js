"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const company_settings_repository_1 = require("./company-settings.repository");
const getSettings = async () => {
    return (0, company_settings_repository_1.getCompanySettings)();
};
exports.getSettings = getSettings;
const updateSettings = async (settings) => {
    return (0, company_settings_repository_1.updateCompanySettings)(settings);
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=company-settings.service.js.map