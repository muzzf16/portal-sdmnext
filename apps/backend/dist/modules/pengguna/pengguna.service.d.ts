declare class PenggunaService {
    static login(email: string, password: string): Promise<{
        accessToken: string;
        user: any;
    }>;
    static register(name: string, email: string, password: string): Promise<any>;
    static getAllPengguna(): Promise<any[]>;
    static getPenggunaById(id: string): Promise<any>;
    static updatePengguna(id: string, data: any): Promise<any>;
    static deletePengguna(id: string): Promise<{
        message: string;
    }>;
}
export default PenggunaService;
//# sourceMappingURL=pengguna.service.d.ts.map