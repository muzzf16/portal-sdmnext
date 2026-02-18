"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_library_controller_1 = __importDefault(require("./activity-library.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/', activity_library_controller_1.default.getAll);
router.get('/positions', activity_library_controller_1.default.getPositions);
router.get('/position/:position', activity_library_controller_1.default.getByPosition);
router.get('/:id', activity_library_controller_1.default.getById);
router.post('/', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan'), activity_library_controller_1.default.create);
router.put('/:id', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan'), activity_library_controller_1.default.update);
router.delete('/:id', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan'), activity_library_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=activity-library.routes.js.map