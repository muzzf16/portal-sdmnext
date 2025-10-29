"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pengingat_otomatis_service_1 = __importDefault(require("./pengingat.otomatis.service"));
class PengingatOtomatisController {
    static async sendContractExpirationReminders(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendContractExpirationReminders();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendLeaveApprovalNotifications(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendLeaveApprovalNotifications();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendPayrollReleaseNotifications(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendPayrollReleaseNotifications();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendPerformanceReviewReminders(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendPerformanceReviewReminders();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendBirthdayReminders(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendBirthdayReminders();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendAllAutomatedReminders(req, res, next) {
        try {
            const result = await pengingat_otomatis_service_1.default.sendAllAutomatedReminders();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PengingatOtomatisController;
//# sourceMappingURL=pengingat.otomatis.controller.js.map