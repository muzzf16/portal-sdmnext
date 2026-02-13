
import api from '../../../shared/services/api';
// import { WorkLoadAnalysis } from '../types';

export const getWorkloadAnalysis = (employeeId: string, year: number) =>
    api.get(`/workload/${employeeId}?year=${year}`);

export const saveWorkloadAnalysis = (data: any) =>
    api.post('/workload', data);
