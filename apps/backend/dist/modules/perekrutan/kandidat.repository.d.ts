export declare const KandidatRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(data: {
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
    }): Promise<{
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
        id: number | undefined;
    }>;
    update(id: string, data: {
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
    }): Promise<{
        name: string;
        email: string;
        phone: string;
        position_applied: string;
        status: string;
        resume_url: string;
        id: string;
    }>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=kandidat.repository.d.ts.map