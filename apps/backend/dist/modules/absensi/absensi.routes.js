"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const absensi_controller_1 = __importDefault(require("./absensi.controller"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', absensi_controller_1.default.getAllAttendanceRecords);
router.get('/:id', absensi_controller_1.default.getAttendanceRecordById);
router.post('/clock-in', absensi_controller_1.default.clockIn);
router.post('/clock-out', absensi_controller_1.default.clockOut);
router.get('/employee/:id', absensi_controller_1.default.getAttendanceByEmployeeId);
router.post('/upload', upload.single('file'), absensi_controller_1.default.uploadLog);
router.post('/', absensi_controller_1.default.createAttendanceRecord);
router.put('/:id', absensi_controller_1.default.updateAttendanceRecord);
router.delete('/:id', absensi_controller_1.default.deleteAttendanceRecord);
exports.default = router;
//# sourceMappingURL=absensi.routes.js.map