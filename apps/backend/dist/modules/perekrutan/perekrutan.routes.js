"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perekrutan_controller_1 = __importDefault(require("./perekrutan.controller"));
const router = (0, express_1.Router)();
router.get('/candidates', perekrutan_controller_1.default.getAllKandidat);
router.get('/candidates/:id', perekrutan_controller_1.default.getKandidatById);
router.post('/candidates', perekrutan_controller_1.default.createKandidat);
router.put('/candidates/:id', perekrutan_controller_1.default.updateKandidat);
router.delete('/candidates/:id', perekrutan_controller_1.default.deleteKandidat);
exports.default = router;
//# sourceMappingURL=perekrutan.routes.js.map