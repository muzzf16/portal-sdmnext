export default class ActivityLibraryService {
    static getAll(filters?: {
        position?: string;
        department?: string;
        category?: string;
    }): Promise<any[]>;
    static getByPosition(position: string): Promise<any[]>;
    static getById(id: string): Promise<any>;
    static getPositions(): Promise<any[]>;
    static create(data: any): Promise<any>;
    static update(id: string, data: any): Promise<any>;
    static delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=activity-library.service.d.ts.map