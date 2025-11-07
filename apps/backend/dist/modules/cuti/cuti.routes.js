"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cuti_controller_1 = __importDefault(require("./cuti.controller"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/documents/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const router = (0, express_1.Router)();
router.get('/', cuti_controller_1.default.getAllPermintaanCuti);
router.get('/employee/:employeeId', cuti_controller_1.default.getPermintaanCutiByEmployeeId);
router.get('/sisa-cuti/:employeeId', cuti_controller_1.default.getSisaCuti);
router.get('/:id', cuti_controller_1.default.getPermintaanCutiById);
router.post('/', upload.single('supportingDocument'), cuti_controller_1.default.submitPermintaanCuti);
router.put('/:id/status', cuti_controller_1.default.updateStatusCuti);
router.delete('/:id', cuti_controller_1.default.deletePermintaanCuti);
exports.default = router;
//# sourceMappingURL=cuti.routes.js.map