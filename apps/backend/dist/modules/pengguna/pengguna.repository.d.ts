export declare const PenggunaRepository: {
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(userData: any): Promise<any>;
    authenticate(email: string, password: string): Promise<any>;
    findAdminUsers(): Promise<any[]>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=pengguna.repository.d.ts.map