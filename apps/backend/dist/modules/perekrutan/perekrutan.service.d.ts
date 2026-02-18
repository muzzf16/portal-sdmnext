declare class PerekrutanService {
    static getAllKandidat(): Promise<any[]>;
    static getKandidatById(id: string): Promise<any>;
    static createKandidat(candidateData: any): Promise<{
        status: string;
        application_date: string;
        name: string;
        email: string;
        phone?: string;
        position_applied: string;
        resume_url?: string;
        cover_letter?: string;
        notes?: string;
        id: number | undefined;
    }>;
    static updateKandidat(id: string, candidateData: any): Promise<any>;
    static deleteKandidat(id: string): Promise<{
        message: string;
    }>;
}
export default PerekrutanService;
//# sourceMappingURL=perekrutan.service.d.ts.map