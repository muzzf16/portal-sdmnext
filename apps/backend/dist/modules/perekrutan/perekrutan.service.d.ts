declare class PerekrutanService {
    static getAllKandidat(): Promise<any[]>;
    static getKandidatById(id: string): Promise<any>;
    static createKandidat(candidateData: any): Promise<{
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
        id: number | undefined;
    }>;
    static updateKandidat(id: string, candidateData: any): Promise<{
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
        id: string;
    }>;
    static deleteKandidat(id: string): Promise<{
        message: string;
    }>;
}
export default PerekrutanService;
//# sourceMappingURL=perekrutan.service.d.ts.map