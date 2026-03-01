"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("./task.controller");
const router = (0, express_1.Router)();
router.post('/', task_controller_1.TaskController.create);
router.get('/supervisor/:supervisor_id', task_controller_1.TaskController.getBySupervisor);
router.get('/employee/:employee_id', task_controller_1.TaskController.getByEmployee);
router.put('/:id/status', task_controller_1.TaskController.updateStatus);
router.delete('/:id', task_controller_1.TaskController.delete);
exports.default = router;
//# sourceMappingURL=task.routes.js.map