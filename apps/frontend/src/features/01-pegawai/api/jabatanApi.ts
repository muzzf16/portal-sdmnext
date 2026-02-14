import api from '../../../shared/services/api';

export interface Jabatan {
    id: number;
    nama: string;
    level: number;
    parent_id: number | null;
    parent_nama?: string;
    department?: string;
    deskripsi?: string;
    children?: JabatanTree[];
    employees?: JabatanEmployee[];
}

export interface JabatanTree extends Jabatan {
    children: JabatanTree[];
    employees?: JabatanEmployee[];
}

export interface JabatanEmployee {
    id: string;
    name: string;
    nip: string;
    position: string;
    department: string;
    avatarUrl?: string;
    jabatan_id?: number;
    atasan_id?: string;
}

const API_BASE = '/jabatan';

export const getJabatanList = async (): Promise<Jabatan[]> => {
    const response = await api.get(`${API_BASE}`);
    return response.data?.data || response.data;
};

export const getJabatanTree = async (): Promise<JabatanTree[]> => {
    const response = await api.get(`${API_BASE}/tree`);
    return response.data?.data || response.data;
};

export const getJabatanTreeWithEmployees = async (): Promise<JabatanTree[]> => {
    const response = await api.get(`${API_BASE}/tree-with-employees`);
    return response.data?.data || response.data;
};

export const getJabatanByLevel = async (level: number): Promise<Jabatan[]> => {
    const response = await api.get(`${API_BASE}/level/${level}`);
    return response.data?.data || response.data;
};

export const getSubordinates = async (pegawaiId: string, recursive = false): Promise<JabatanEmployee[]> => {
    const response = await api.get(`${API_BASE}/subordinates/${pegawaiId}?recursive=${recursive}`);
    return response.data?.data || response.data;
};

export const createJabatan = async (data: Partial<Jabatan>): Promise<Jabatan> => {
    const response = await api.post(API_BASE, data);
    return response.data?.data || response.data;
};

export const updateJabatan = async (id: number, data: Partial<Jabatan>): Promise<Jabatan> => {
    const response = await api.put(`${API_BASE}/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteJabatan = async (id: number): Promise<void> => {
    await api.delete(`${API_BASE}/${id}`);
};
