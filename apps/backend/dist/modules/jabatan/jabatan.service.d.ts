declare class JabatanService {
    static getAll(): Promise<any[]>;
    static getById(id: number): Promise<any>;
    static getByLevel(level: number): Promise<any[]>;
    static getTree(): Promise<any[]>;
    static getTreeWithEmployees(): Promise<any[]>;
    static getSubordinates(pegawaiId: string): Promise<any[]>;
    static getAllSubordinates(pegawaiId: string): Promise<any[]>;
    static create(data: any): Promise<any>;
    static update(id: number, data: any): Promise<any>;
    static delete(id: number): Promise<{
        message: string;
    }>;
}
export default JabatanService;
//# sourceMappingURL=jabatan.service.d.ts.map