"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const custom_report_controller_1 = __importDefault(require("./custom-report.controller"));
const router = (0, express_1.Router)();
router.get('/metadata', custom_report_controller_1.default.getReportMetadata);
router.post('/generate', custom_report_controller_1.default.generateCustomReport);
router.post('/export', custom_report_controller_1.default.exportCustomReport);
exports.default = router;
//# sourceMappingURL=custom-report.routes.js.map