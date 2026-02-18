"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_pengguna_controller_1 = __importDefault(require("./auth.pengguna.controller"));
const router = (0, express_1.Router)();
router.post('/login', auth_pengguna_controller_1.default.login);
router.post('/register', auth_pengguna_controller_1.default.register);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map