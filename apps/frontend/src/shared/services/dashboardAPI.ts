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