"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("./task.service");
exports.TaskController = {
    async create(req, res, next) {
        try {
            const task = await task_service_1.TaskService.createTask(req.body);
            res.status(201).json({ success: true, message: 'Tugas berhasil dibuat', data: task });
        }
        catch (error) {
            next(error);
        }
    },
    async getBySupervisor(req, res, next) {
        try {
            const { supervisor_id } = req.params;
            const tasks = await task_service_1.TaskService.getTasksBySupervisor(supervisor_id);
            res.json({ success: true, data: tasks });
        }
        catch (error) {
            next(error);
        }
    },
    async getByEmployee(req, res, next) {
        try {
            const { employee_id } = req.params;
            const { status } = req.query;
            const tasks = await task_service_1.TaskService.getTasksByEmployee(employee_id, status);
            res.json({ success: true, data: tasks });
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const task = await task_service_1.TaskService.updateTaskStatus(id, status);
            res.json({ success: true, message: 'Status tugas berhasil diupdate', data: task });
        }
        catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await task_service_1.TaskService.deleteTask(id);
            res.json({ success: true, message: 'Tugas berhasil dihapus' });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=task.controller.js.map