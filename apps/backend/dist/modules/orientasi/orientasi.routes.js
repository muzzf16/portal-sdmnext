"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orientasi_controller_1 = __importDefault(require("./orientasi.controller"));
const router = (0, express_1.Router)();
router.get('/employee/:employeeId/tasks', orientasi_controller_1.default.getTugasOrientasiByEmployeeId);
router.post('/employee/:employeeId/tasks', orientasi_controller_1.default.createTugasOrientasi);
router.put('/tasks/:taskId', orientasi_controller_1.default.updateTugasOrientasi);
router.delete('/tasks/:taskId', orientasi_controller_1.default.deleteTugasOrientasi);
exports.default = router;
//# sourceMappingURL=orientasi.routes.js.map