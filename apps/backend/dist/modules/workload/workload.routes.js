"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workload_controller_1 = __importDefault(require("./workload.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/:employeeId', workload_controller_1.default.getAnalysis);
router.post('/', workload_controller_1.default.saveAnalysis);
exports.default = router;
//# sourceMappingURL=workload.routes.js.map