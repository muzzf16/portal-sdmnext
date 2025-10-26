"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifikasi_controller_1 = __importDefault(require("./notifikasi.controller"));
const router = (0, express_1.Router)();
router.get('/employee/:employeeId', notifikasi_controller_1.default.getNotifikasiByEmployeeId);
router.get('/employee/:employeeId/unread', notifikasi_controller_1.default.getUnreadNotifikasiByEmployeeId);
router.post('/employee/:employeeId', notifikasi_controller_1.default.createNotifikasi);
router.put('/:notificationId/read', notifikasi_controller_1.default.markNotifikasiAsRead);
router.get('/scheduled', notifikasi_controller_1.default.getScheduledNotifikasi);
exports.default = router;
//# sourceMappingURL=notifikasi.routes.js.map