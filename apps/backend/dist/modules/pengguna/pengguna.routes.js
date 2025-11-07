"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pengguna_controller_1 = __importDefault(require("./pengguna.controller"));
const router = (0, express_1.Router)();
router.get('/', pengguna_controller_1.default.getAllPengguna);
router.get('/:id', pengguna_controller_1.default.getPenggunaById);
router.put('/:id', pengguna_controller_1.default.updatePengguna);
router.delete('/:id', pengguna_controller_1.default.deletePengguna);
exports.default = router;
//# sourceMappingURL=pengguna.routes.js.map