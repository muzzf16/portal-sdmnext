import api from '../../../shared/services/api';
import { KpiTarget } from '../types';

export const getKpiTargets = (filters?: { employeeId?: string; period?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.period) params.append('period', filters.period);
    if (filters?.status) params.append('status', filters.status);
    const qs = params.toString();
    return api.get(`/kpi-targets${qs ? `?${qs}` : ''}`);
};

export const getKpiByEmployeeId = (employeeId: string) =>
    api.get(`/kpi-targets/employee/${employeeId}`);

export const getKpiById = (id: string) =>
    api.get(`/kpi-targets/${id}`);

export const createKpiTarget = (data: Omit<KpiTarget, 'id' | 'score' | 'created_at' | 'updated_at'>) =>
    api.post('/kpi-targets', data);

export const updateKpiTarget = (id: string, data: Partial<KpiTarget>) =>
    api.put(`/kpi-targets/${id}`, data);

export const updateActualValue = (id: string, actualValue: number) =>
    api.put(`/kpi-targets/${id}/actual`, { actualValue });

export const deleteKpiTarget = (id: string) =>
    api.delete(`/kpi-targets/${id}`);

export const generateKpiFromAbk = (employeeId: string, year: number, period: string) =>
    api.post('/kpi-targets/generate-from-abk', { employeeId, year, period });
