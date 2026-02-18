export declare const KandidatRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(data: {
        name: string;
        email: string;
        phone?: string;
        position_applied: string;
        status?: string;
        resume_url?: string;
        cover_letter?: string;
        application_date?: string;
        notes?: string;
    }): Promise<{
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
    update(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        position_applied?: string;
        status?: string;
        resume_url?: string;
        cover_letter?: string;
        application_date?: string;
        notes?: string;
    }): Promise<any>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=kandidat.repository.d.ts.map