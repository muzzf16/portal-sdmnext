import { DataChangeRequest } from './permintaanPerubahanData.model';
export declare const createRequest: (request: DataChangeRequest) => Promise<number | undefined>;
export declare const findAllRequests: () => Promise<DataChangeRequest[]>;
export declare const findRequestById: (id: number) => Promise<DataChangeRequest | undefined>;
export declare const updateRequestStatus: (id: number, status: string, reviewedBy: string, reviewNotes: string) => Promise<void>;
//# sourceMappingURL=permintaanPerubahanData.repository.d.ts.map