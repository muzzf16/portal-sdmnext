import api from '../../../shared/utils/apiService';

export const getTasksBySupervisor = (supervisorId: string) => {
    return api.get(`/tasks/supervisor/${supervisorId}`);
};

export const getTasksByEmployee = (employeeId: string, status?: string) => {
    let url = `/tasks/employee/${employeeId}`;
    if (status) url += `?status=${status}`;
    return api.get(url);
};

export const createTask = (data: any) => {
    return api.post('/tasks', data);
};

export const updateTaskStatus = (id: string, status: string) => {
    return api.put(`/tasks/${id}/status`, { status });
};

export const deleteTask = (id: string) => {
    return api.delete(`/tasks/${id}`);
};
