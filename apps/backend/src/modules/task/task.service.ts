import { TaskRepository } from './task.repository';
import { AppError } from '../../utils/errors';

export const TaskService = {
    async createTask(data: any) {
        if (!data.supervisor_id || !data.employee_id || !data.task_name) {
            throw new AppError('supervisor_id, employee_id, and task_name are required', 400);
        }
        return await TaskRepository.create(data);
    },

    async getTasksBySupervisor(supervisor_id: string) {
        if (!supervisor_id) throw new AppError('supervisor_id is required', 400);
        return await TaskRepository.findBySupervisorId(supervisor_id);
    },

    async getTasksByEmployee(employee_id: string, status?: string) {
        if (!employee_id) throw new AppError('employee_id is required', 400);
        return await TaskRepository.findByEmployeeId(employee_id, status);
    },

    async updateTaskStatus(id: string, status: string) {
        if (!id || !status) throw new AppError('id and status are required', 400);
        if (!['pending', 'completed', 'cancelled', 'approved'].includes(status)) {
            throw new AppError('Invalid status. Must be pending, completed, cancelled, or approved', 400);
        }

        const task = await TaskRepository.findById(id);
        if (!task) throw new AppError('Task not found', 404);

        return await TaskRepository.updateStatus(id, status);
    },

    async deleteTask(id: string) {
        if (!id) throw new AppError('id is required', 400);

        const task = await TaskRepository.findById(id);
        if (!task) throw new AppError('Task not found', 404);

        return await TaskRepository.delete(id);
    }
};
