export declare const JabatanRepository: {
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any>;
    findByLevel(level: number): Promise<any[]>;
    findChildren(parentId: number): Promise<any[]>;
    getTree(): Promise<any[]>;
    getTreeWithEmployees(): Promise<any[]>;
    getSubordinates(pegawaiId: string): Promise<any[]>;
    getAllSubordinates(pegawaiId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<boolean>;
};
//# sourceMappingURL=jabatan.repository.d.ts.map