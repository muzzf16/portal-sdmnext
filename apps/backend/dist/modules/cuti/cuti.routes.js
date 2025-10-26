"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cuti_controller_1 = __importDefault(require("./cuti.controller"));
const router = (0, express_1.Router)();
router.get('/', cuti_controller_1.default.getAllPermintaanCuti);
router.get('/:id', cuti_controller_1.default.getPermintaanCutiById);
router.post('/', cuti_controller_1.default.submitPermintaanCuti);
router.put('/:id/status', cuti_controller_1.default.updateStatusCuti);
router.delete('/:id', cuti_controller_1.default.deletePermintaanCuti);
exports.default = router;
//# sourceMappingURL=cuti.routes.js.map