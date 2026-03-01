"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const task_repository_1 = require("./task.repository");
const errors_1 = require("../../utils/errors");
exports.TaskService = {
    async createTask(data) {
        if (!data.supervisor_id || !data.employee_id || !data.task_name) {
            throw new errors_1.AppError('supervisor_id, employee_id, and task_name are required', 400);
        }
        return await task_repository_1.TaskRepository.create(data);
    },
    async getTasksBySupervisor(supervisor_id) {
        if (!supervisor_id)
            throw new errors_1.AppError('supervisor_id is required', 400);
        return await task_repository_1.TaskRepository.findBySupervisorId(supervisor_id);
    },
    async getTasksByEmployee(employee_id, status) {
        if (!employee_id)
            throw new errors_1.AppError('employee_id is required', 400);
        return await task_repository_1.TaskRepository.findByEmployeeId(employee_id, status);
    },
    async updateTaskStatus(id, status) {
        if (!id || !status)
            throw new errors_1.AppError('id and status are required', 400);
        if (!['pending', 'completed', 'cancelled', 'approved'].includes(status)) {
            throw new errors_1.AppError('Invalid status. Must be pending, completed, cancelled, or approved', 400);
        }
        const task = await task_repository_1.TaskRepository.findById(id);
        if (!task)
            throw new errors_1.AppError('Task not found', 404);
        return await task_repository_1.TaskRepository.updateStatus(id, status);
    },
    async deleteTask(id) {
        if (!id)
            throw new errors_1.AppError('id is required', 400);
        const task = await task_repository_1.TaskRepository.findById(id);
        if (!task)
            throw new errors_1.AppError('Task not found', 404);
        return await task_repository_1.TaskRepository.delete(id);
    }
};
//# sourceMappingURL=task.service.js.map