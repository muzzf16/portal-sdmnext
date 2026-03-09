"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kinerja_controller_1 = __importDefault(require("./kinerja.controller"));
const router = (0, express_1.Router)();
router.get('/', kinerja_controller_1.default.getAllPenilaianKinerja);
router.get('/employee/:id', kinerja_controller_1.default.getPenilaianKinerjaByEmployeeId);
router.get('/:id', kinerja_controller_1.default.getPenilaianKinerjaById);
router.post('/', kinerja_controller_1.default.createPenilaianKinerja);
router.put('/:id', kinerja_controller_1.default.updatePenilaianKinerja);
router.put('/:id/feedback', kinerja_controller_1.default.addFeedbackKinerja);
router.put('/:id/self-assessment', kinerja_controller_1.default.submitSelfAssessment);
router.put('/:id/transition', kinerja_controller_1.default.transitionStatus);
router.delete('/:id', kinerja_controller_1.default.deletePenilaianKinerja);
exports.default = router;
//# sourceMappingURL=kinerja.routes.js.map