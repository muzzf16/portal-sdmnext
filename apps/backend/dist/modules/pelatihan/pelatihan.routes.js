"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pelatihan_controller_1 = __importDefault(require("./pelatihan.controller"));
const router = (0, express_1.Router)();
router.get('/employee/:id', pelatihan_controller_1.default.getPelatihanByEmployeeId);
router.post('/employee/:id', pelatihan_controller_1.default.addPelatihan);
exports.default = router;
//# sourceMappingURL=pelatihan.routes.js.map