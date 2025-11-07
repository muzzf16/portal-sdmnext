declare class PegawaiAuthService {
    static createEmployeeWithUser(pegawaiData: any, photo?: Express.Multer.File): Promise<{
        employee: any;
        user: any;
    }>;
}
export default PegawaiAuthService;
//# sourceMappingURL=pegawai.auth.service.d.ts.map