import api from './api';

export const getRecentActivity = async () => {
    try {
        const response = await api.get('/dashboard/recent-activity');
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error in getRecentActivity:', error);
        throw error;
    }
};

export const getAdminDashboardData = async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
};

export const getSupervisorDashboardData = async () => {
    const response = await api.get('/dashboard/supervisor');
    return response.data;
};

export const getEmployeeDashboardData = async (employeeId: string) => {
    const response = await api.get(`/dashboard/employee/${employeeId}`);
    return response.data;
};