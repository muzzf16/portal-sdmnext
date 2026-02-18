"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jabatan_controller_1 = __importDefault(require("./jabatan.controller"));
const router = (0, express_1.Router)();
router.get('/tree', jabatan_controller_1.default.getTree);
router.get('/tree-with-employees', jabatan_controller_1.default.getTreeWithEmployees);
router.get('/level/:level', jabatan_controller_1.default.getByLevel);
router.get('/subordinates/:pegawaiId', jabatan_controller_1.default.getSubordinates);
router.get('/', jabatan_controller_1.default.getAll);
router.get('/:id', jabatan_controller_1.default.getById);
router.post('/', jabatan_controller_1.default.create);
router.put('/:id', jabatan_controller_1.default.update);
router.delete('/:id', jabatan_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=jabatan.routes.js.map