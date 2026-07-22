import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/app/providers/ToastContext';
import * as api from '../api/laporanKepatuhanApi';
import { CreateLaporanKepatuhanPayload, UpdateLaporanKepatuhanPayload } from '../types';

export const useAllLaporan = (employeeId?: string) => {
  return useQuery({
    queryKey: ['laporan-kepatuhan', 'all', employeeId],
    queryFn: async () => {
      const res = await api.getAllLaporan(employeeId);
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    }
  });
};

export const useMyLaporan = () => {
  return useQuery({
    queryKey: ['laporan-kepatuhan', 'my'],
    queryFn: async () => {
      const res = await api.getMyLaporan();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    }
  });
};

export const useCreateLaporan = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateLaporanKepatuhanPayload) => api.createLaporan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kepatuhan'] });
      addToast('Laporan berhasil ditambahkan', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Gagal menambahkan laporan', 'error');
    }
  });
};

export const useUpdateLaporan = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLaporanKepatuhanPayload }) => api.updateLaporan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kepatuhan'] });
      addToast('Laporan berhasil diperbarui', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Gagal memperbarui laporan', 'error');
    }
  });
};

export const useDeleteLaporan = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteLaporan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kepatuhan'] });
      addToast('Laporan berhasil dihapus', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Gagal menghapus laporan', 'error');
    }
  });
};

export const useUploadExcelLaporan = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (file: File) => api.uploadExcelLaporan(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['laporan-kepatuhan'] });
      addToast(`Berhasil mengimport ${res.data?.imported || 0} jadwal laporan`, 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Gagal mengimport jadwal laporan', 'error');
    }
  });
};
