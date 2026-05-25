import api from '../../../shared/services/api';
import { 
    KreditBerkas, 
    CreateKreditBerkasDto, 
    UpdateKreditStageDto,
    WANotificationLog 
} from '../types';

const BASE_URL = '/kredit-berkas';

export const getKreditBerkas = (filters?: any) => 
    api.get<{ success: boolean, data: KreditBerkas[] }>(BASE_URL, { params: filters });

export const getKreditBerkasById = (id: number) => 
    api.get<{ success: boolean, data: KreditBerkas }>(`${BASE_URL}/${id}`);

export const getPendingKreditBerkas = (employeeId?: string) => 
    api.get<{ success: boolean, data: (KreditBerkas & { stage_received_at: string })[] }>(`${BASE_URL}/pending`, { params: { employee_id: employeeId } });

export const createKreditBerkas = (data: CreateKreditBerkasDto) => 
    api.post<{ success: boolean, data: KreditBerkas }>(BASE_URL, data);

export const processKreditStage = (id: number, data: UpdateKreditStageDto) => 
    api.put<{ success: boolean, data: KreditBerkas }>(`${BASE_URL}/${id}/process`, data);

export const getKreditMonitoring = () => 
    api.get<{ success: boolean, data: KreditBerkas[] }>(`${BASE_URL}/monitoring`);

export const getWaNotificationLog = (berkasId: number) =>
    api.get<{ success: boolean, data: WANotificationLog[] }>(`${BASE_URL}/${berkasId}/wa-log`);

export const resendWaNotification = (logId: number) =>
    api.post<{ success: boolean, message: string }>(`${BASE_URL}/wa-resend/${logId}`);
