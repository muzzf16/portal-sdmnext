export declare const ActivityLibraryRepository: {
    findAll(filters?: {
        position?: string;
        department?: string;
        category?: string;
    }): Promise<any[]>;
    findByPosition(position: string): Promise<any[]>;
    findById(id: string): Promise<any>;
    getPositions(): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
};
//# sourceMappingURL=activity-library.repository.d.ts.map