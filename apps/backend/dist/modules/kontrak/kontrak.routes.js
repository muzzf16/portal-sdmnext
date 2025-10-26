"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kontrak_controller_1 = __importDefault(require("./kontrak.controller"));
const router = (0, express_1.Router)();
router.get('/', kontrak_controller_1.default.getAllContracts);
router.get('/:id', kontrak_controller_1.default.getContractById);
router.get('/employee/:employeeId', kontrak_controller_1.default.getContractsByEmployeeId);
router.get('/expiring', kontrak_controller_1.default.getExpiringContracts);
router.post('/', kontrak_controller_1.default.createContract);
router.put('/:id', kontrak_controller_1.default.updateContract);
router.delete('/:id', kontrak_controller_1.default.deleteContract);
router.get('/job-history/employee/:id', kontrak_controller_1.default.getRiwayatJabatan);
router.post('/job-history/employee/:id', kontrak_controller_1.default.addRiwayatJabatan);
exports.default = router;
//# sourceMappingURL=kontrak.routes.js.map