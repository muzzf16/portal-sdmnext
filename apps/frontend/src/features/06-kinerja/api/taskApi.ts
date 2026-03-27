import api from '../../../shared/services/api';
import { AssignedTask } from '../../../shared/types/types';

export type TaskStatus = AssignedTask['status'];

export interface CreateTaskPayload {
    supervisor_id: string;
    employee_id: string;
    task_name: string;
    description?: string;
}

export const getTasksBySupervisor = (supervisorId: string) => {
    return api.get<{ success: boolean; data: AssignedTask[] }>(`/tasks/supervisor/${supervisorId}`);
};

export const getTasksByEmployee = (employeeId: string, status?: TaskStatus) => {
    let url = `/tasks/employee/${employeeId}`;
    if (status) url += `?status=${status}`;
    return api.get<{ success: boolean; data: AssignedTask[] }>(url);
};

export const createTask = (data: CreateTaskPayload) => {
    return api.post<{ success: boolean; data: AssignedTask }>('/tasks', data);
};

export const updateTaskStatus = (id: string, status: TaskStatus) => {
    return api.put<{ success: boolean; data: AssignedTask }>(`/tasks/${id}/status`, { status });
};

export const deleteTask = (id: string) => {
    return api.delete(`/tasks/${id}`);
};
