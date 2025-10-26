"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const penggajian_controller_1 = __importDefault(require("./penggajian.controller"));
const router = (0, express_1.Router)();
router.get('/', penggajian_controller_1.default.getAllPenggajian);
router.get('/:id', penggajian_controller_1.default.getPenggajianById);
router.get('/employee/:id', penggajian_controller_1.default.getPenggajianByEmployeeId);
router.post('/', penggajian_controller_1.default.createPenggajian);
router.put('/:id', penggajian_controller_1.default.updatePenggajian);
router.delete('/:id', penggajian_controller_1.default.deletePenggajian);
exports.default = router;
//# sourceMappingURL=penggajian.routes.js.map