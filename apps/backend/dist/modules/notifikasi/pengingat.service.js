"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifikasi_service_1 = __importDefault(require("./notifikasi.service"));
const kontrak_service_1 = __importDefault(require("../kontrak/kontrak.service"));
const errors_1 = require("../../utils/errors");
class PengingatService {
    static async sendContractExpirationReminders() {
        try {
            const allExpiringContracts = [
                ...await kontrak_service_1.default.getExpiringContracts(30),
                ...await kontrak_service_1.default.getExpiringContracts(14),
                ...await kontrak_service_1.default.getExpiringContracts(7)
            ];
            for (const contract of allExpiringContracts) {
                const daysToExpiration = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if ([30, 14, 7].includes(daysToExpiration)) {
                    await notifikasi_service_1.default.createContractExpirationReminder(contract.employeeId, contract.id, daysToExpiration);
                }
            }
            return { message: `${allExpiringContracts.length} contract expiration reminders scheduled` };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending contract expiration reminders: ${error.message}`, 500);
        }
    }
}
exports.default = PengingatService;
//# sourceMappingURL=pengingat.service.js.map