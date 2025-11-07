declare class AuthPenggunaService {
    static login(email: string, password: string): Promise<{
        accessToken: string;
        user: any;
    }>;
    static register(name: string, email: string, password: string, role?: string): Promise<{
        message: string;
        userId: any;
    }>;
}
export default AuthPenggunaService;
//# sourceMappingURL=auth.pengguna.service.d.ts.map