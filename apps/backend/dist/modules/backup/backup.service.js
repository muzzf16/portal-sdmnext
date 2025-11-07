"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreDatabase = exports.backupDatabase = void 0;
const backupDatabase = async () => {
    return { message: 'Database backup created successfully' };
};
exports.backupDatabase = backupDatabase;
const restoreDatabase = async () => {
    return { message: 'Database restored successfully' };
};
exports.restoreDatabase = restoreDatabase;
//# sourceMappingURL=backup.service.js.map