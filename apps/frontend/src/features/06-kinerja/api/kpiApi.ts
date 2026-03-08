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

export const updateActualValue = (id: string, actualValue: number, evidenceFile?: File) => {
    const formData = new FormData();
    formData.append('actualValue', String(actualValue));
    if (evidenceFile) {
        formData.append('evidence', evidenceFile);
    }
    return api.put(`/kpi-targets/${id}/actual`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadEvidence = (id: string, file: File) => {
    const formData = new FormData();
    formData.append('evidence', file);
    return api.post(`/kpi-targets/${id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const deleteKpiTarget = (id: string) =>
    api.delete(`/kpi-targets/${id}`);

export const generateKpiFromAbk = (employeeId: string, year: number, period: string) =>
    api.post('/kpi-targets/generate-from-abk', { employeeId, year, period });

export const syncKpiFromWla = (employeeId: string, period: string) =>
    api.post('/kpi-targets/sync-wla', { employeeId, period });

// KPI Templates
export const getKpiTemplates = (department?: string) =>
    api.get(`/kpi-templates${department ? `?department=${encodeURIComponent(department)}` : ''}`);

export const applyKpiTemplates = (data: { employeeId: string; period: string; department?: string; templateIds?: string[] }) =>
    api.post('/kpi-templates/apply', data);
