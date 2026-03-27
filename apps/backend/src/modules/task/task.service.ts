import { AppError } from '../../utils/errors';
import { TaskRepository } from './task.repository';
import { CreateTaskPayload, TaskStatus } from './task.types';

const VALID_TASK_STATUSES: TaskStatus[] = ['pending', 'completed', 'cancelled', 'approved'];

const normalizeText = (value?: string) => value?.trim() || '';

const normalizeCreatePayload = (data: CreateTaskPayload): CreateTaskPayload => ({
    id: data.id,
    supervisor_id: normalizeText(data.supervisor_id),
    employee_id: normalizeText(data.employee_id),
    task_name: normalizeText(data.task_name),
    description: normalizeText(data.description)
});

const normalizeStatus = (status?: string): TaskStatus | undefined => {
    const normalized = normalizeText(status) as TaskStatus;
    if (!normalized) {
        return undefined;
    }

    if (!VALID_TASK_STATUSES.includes(normalized)) {
        throw new AppError('Invalid status. Must be pending, completed, cancelled, or approved', 400);
    }

    return normalized;
};

const assertValidStatusTransition = (currentStatus: TaskStatus, nextStatus: TaskStatus) => {
    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
        pending: ['completed', 'cancelled'],
        completed: ['approved', 'cancelled'],
        approved: ['approved'],
        cancelled: ['cancelled']
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
        throw new AppError(`Task with status ${currentStatus} cannot be changed to ${nextStatus}`, 400);
    }
};

export const TaskService = {
    async createTask(data: CreateTaskPayload) {
        const payload = normalizeCreatePayload(data);

        if (!payload.supervisor_id || !payload.employee_id || !payload.task_name) {
            throw new AppError('supervisor_id, employee_id, and task_name are required', 400);
        }

        if (payload.supervisor_id === payload.employee_id) {
            throw new AppError('Supervisor and employee cannot be the same person', 400);
        }

        return TaskRepository.create(payload);
    },

    async getTasksBySupervisor(supervisor_id: string) {
        const normalizedSupervisorId = normalizeText(supervisor_id);
        if (!normalizedSupervisorId) {
            throw new AppError('supervisor_id is required', 400);
        }

        return TaskRepository.findBySupervisorId(normalizedSupervisorId);
    },

    async getTasksByEmployee(employee_id: string, status?: string) {
        const normalizedEmployeeId = normalizeText(employee_id);
        if (!normalizedEmployeeId) {
            throw new AppError('employee_id is required', 400);
        }

        const normalizedStatus = normalizeStatus(status);
        return TaskRepository.findByEmployeeId(normalizedEmployeeId, normalizedStatus);
    },

    async updateTaskStatus(id: string, status: string) {
        const normalizedId = normalizeText(id);
        const normalizedStatus = normalizeStatus(status);

        if (!normalizedId || !normalizedStatus) {
            throw new AppError('id and status are required', 400);
        }

        const task = await TaskRepository.findById(normalizedId);
        if (!task) {
            throw new AppError('Task not found', 404);
        }

        assertValidStatusTransition(task.status, normalizedStatus);
        return TaskRepository.updateStatus(normalizedId, normalizedStatus);
    },

    async deleteTask(id: string) {
        const normalizedId = normalizeText(id);
        if (!normalizedId) {
            throw new AppError('id is required', 400);
        }

        const task = await TaskRepository.findById(normalizedId);
        if (!task) {
            throw new AppError('Task not found', 404);
        }

        return TaskRepository.delete(normalizedId);
    }
};
