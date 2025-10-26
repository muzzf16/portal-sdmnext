"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifikasi_service_1 = __importDefault(require("./notifikasi.service"));
class NotifikasiController {
    static async getNotifikasiByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const notifications = await notifikasi_service_1.default.getNotifikasiByEmployeeId(employeeId);
            res.status(200).json({
                success: true,
                data: notifications
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUnreadNotifikasiByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const notifications = await notifikasi_service_1.default.getUnreadNotifikasiByEmployeeId(employeeId);
            res.status(200).json({
                success: true,
                data: notifications
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createNotifikasi(req, res, next) {
        try {
            const { employeeId } = req.params;
            const { message, type, delivery_channel, related_entity, related_entity_id, scheduled_for } = req.body;
            const notificationData = {
                employee_id: employeeId,
                message,
                type,
                delivery_channel,
                related_entity,
                related_entity_id,
                scheduled_for
            };
            const newNotification = await notifikasi_service_1.default.createNotifikasi(notificationData);
            res.status(201).json({
                success: true,
                data: newNotification
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markNotifikasiAsRead(req, res, next) {
        try {
            const { notificationId } = req.params;
            const result = await notifikasi_service_1.default.markNotifikasiAsRead(notificationId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Notification marked as read successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getScheduledNotifikasi(req, res, next) {
        try {
            const notifications = await notifikasi_service_1.default.getScheduledNotifikasi();
            res.status(200).json({
                success: true,
                data: notifications
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = NotifikasiController;
//# sourceMappingURL=notifikasi.controller.js.map