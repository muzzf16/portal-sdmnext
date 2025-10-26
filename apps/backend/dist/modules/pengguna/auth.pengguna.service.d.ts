declare class AuthPenggunaService {
    static login(email: string, password: string): Promise<{
        token: string;
        user: any;
    }>;
    static register(name: string, email: string, password: string): Promise<{
        message: string;
        userId: any;
    }>;
}
export default AuthPenggunaService;
//# sourceMappingURL=auth.pengguna.service.d.ts.map