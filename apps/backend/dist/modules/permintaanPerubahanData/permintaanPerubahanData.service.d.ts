import { DataChangeRequest } from './permintaanPerubahanData.model';
export declare const createChangeRequest: (request: DataChangeRequest) => Promise<number | undefined>;
export declare const getAllChangeRequests: () => Promise<DataChangeRequest[]>;
export declare const processChangeRequest: (id: number, status: string, reviewedBy: string, reviewNotes: string) => Promise<void>;
//# sourceMappingURL=permintaanPerubahanData.service.d.ts.map