// src/features/11-arsip-dokumen/hooks/useArsipDokumen.ts
import { useState, useEffect, useCallback } from 'react';
import {
  ArsipDokumen,
  ArsipDokumenFilters,
  ArsipDokumenStats,
} from '../types';
import {
  getArsipDokumen,
  getArsipDokumenStats,
  getArsipDokumenExpiring,
  createArsipDokumen,
  updateArsipDokumen,
  deleteArsipDokumen,
} from '../api/arsipDokumenApi';

export const useArsipDokumen = (initialFilters?: ArsipDokumenFilters) => {
  const [dokumen, setDokumen] = useState<ArsipDokumen[]>([]);
  const [stats, setStats] = useState<ArsipDokumenStats | null>(null);
  const [expiring, setExpiring] = useState<ArsipDokumen[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ArsipDokumenFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  const fetchDokumen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getArsipDokumen(filters);
      const responseData = res.data as any;
      setDokumen(responseData.data ?? []);
      setTotal(responseData.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Gagal mengambil data dokumen');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getArsipDokumenStats();
      setStats(res.data.data);

      const expiringRes = await getArsipDokumenExpiring(30);
      setExpiring(expiringRes.data.data ?? []);
    } catch (err: any) {
      console.error('Gagal mengambil statistik:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreate = useCallback(async (formData: FormData) => {
    const res = await createArsipDokumen(formData);
    await fetchDokumen();
    await fetchStats();
    return res.data.data;
  }, [fetchDokumen, fetchStats]);

  const handleUpdate = useCallback(async (id: string, formData: FormData) => {
    const res = await updateArsipDokumen(id, formData);
    await fetchDokumen();
    await fetchStats();
    return res.data.data;
  }, [fetchDokumen, fetchStats]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteArsipDokumen(id);
    await fetchDokumen();
    await fetchStats();
  }, [fetchDokumen, fetchStats]);

  const updateFilters = useCallback((newFilters: Partial<ArsipDokumenFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }, []);

  const totalPages = Math.ceil(total / (filters.limit ?? 12));

  return {
    dokumen,
    stats,
    expiring,
    total,
    totalPages,
    loading,
    statsLoading,
    error,
    filters,
    updateFilters,
    refetch: fetchDokumen,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
