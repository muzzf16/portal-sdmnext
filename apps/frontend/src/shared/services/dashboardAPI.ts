import api from './api';

export const getRecentActivity = () => api.get('/dashboard/recent-activity');