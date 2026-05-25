import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Textarea } from '../../../shared/components/ui/Textarea';

import { 
    KreditBerkas, 
    BerkasStatus, 
    CreateKreditBerkasDto, 
    UpdateKreditStageDto 
} from '../types';
import { usePegawaiList } from '../../01-pegawai/hooks/usePegawaiList';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useSubordinates } from '../hooks/usePerformanceManagementQuery';

interface KreditBerkasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateKreditBerkasDto | UpdateKreditStageDto) => void;
    mode: 'create' | 'process';
    berkas?: KreditBerkas;
    isLoading?: boolean;
    titleOverride?: string;
}

const STAGE_LABELS: Record<string, string> = {
    'penerimaan': 'Penerimaan Berkas',
    'slik': 'Pengecekan SLIK',
    'delegasi_survey': 'Delegasi Survey',
    'ots': 'Survey Lapangan (OTS)',
    'komite_kredit': 'Komite Kredit',
    'mak_agunan': 'Analisa MAK & Agunan',
    'approval_keputusan': 'Persetujuan & Keputusan Final',
    'admin_spk': 'Pembuatan SPK',
    'pencairan': 'Pencairan',
    'selesai': 'Selesai',
    'ditolak_cs': 'Ditolak - Penanganan CS',
    // Legacy
    'analisa': 'Analisa & Survey',
    'verifikasi': 'Verifikasi & Approval',
    'admin_pencairan': 'Admin & Pencairan'
};

export const KreditBerkasModal: React.FC<KreditBerkasModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    berkas,
    isLoading,
    titleOverride
}) => {
    const { user } = useAuth();
    const { pegawai } = usePegawaiList();
    
    const supervisorId = user?.employeeId || (user as any)?.id || '';
    const { data: subordinates = [] } = useSubordinates(supervisorId);
    
    // Find KABID (current user) details in pegawai list to have full Pegawai type mapping
    const currentUserPegawai = (pegawai || []).find(p => p.id === supervisorId);
    
    const selfUser = currentUserPegawai || (user ? {
        id: supervisorId,
        name: user.name || 'Diri Sendiri',
        position: (user as any)?.position || (user as any)?.employeeDetails?.position || 'KABID Kredit'
    } : null);

    // Construct option list: subordinates + self + fallbacks/marketing staff (deduplicated)
    const surveyorOptions = useMemo(() => {
        const list: Array<{ id: string; name: string; position: string }> = [];
        const seenIds = new Set<string>();

        // 1. Add subordinates
        (subordinates || []).forEach(sub => {
            if (sub && sub.id && !seenIds.has(sub.id)) {
                seenIds.add(sub.id);
                list.push({
                    id: sub.id,
                    name: sub.name,
                    position: sub.position
                });
            }
        });

        // 2. Add self (KABID Kredit themselves)
        if (selfUser && selfUser.id && !seenIds.has(selfUser.id)) {
            seenIds.add(selfUser.id);
            list.push({
                id: selfUser.id,
                name: `${selfUser.name} (Diri Sendiri)`,
                position: selfUser.position || 'KABID Kredit'
            });
        }

        // 3. Fallback: staf marketing
        (pegawai || []).forEach(p => {
            const rawPos = p.position || '';
            const pos = (rawPos || '').toLowerCase();
            const isMarketing = pos.includes('staf marketing') || pos === 'staf marketing';
            if (isMarketing && p.id && !seenIds.has(p.id)) {
                seenIds.add(p.id);
                list.push({
                    id: p.id,
                    name: p.name,
                    position: p.position
                });
            }
        });

        return list;
    }, [subordinates, selfUser, pegawai]);

    const [formData, setFormData] = useState({
        nama_pengajuan: '',
        jumlah_pengajuan: 0,
        jenis_kredit: 'Kredit Umum',
        no_wa_nasabah: '',
        status_berkas: 'belum_lengkap' as BerkasStatus,
        catatan: '',
        assigned_employee_id: ''
    });

    useEffect(() => {
        if (mode === 'create') {
            setFormData({
                nama_pengajuan: '',
                jumlah_pengajuan: 0,
                jenis_kredit: 'Kredit Umum',
                no_wa_nasabah: '',
                status_berkas: 'belum_lengkap',
                catatan: '',
                assigned_employee_id: ''
            });
        } else if (berkas) {
            setFormData(prev => ({
                ...prev,
                status_berkas: 'belum_lengkap',
                catatan: '',
                assigned_employee_id: ''
            }));
        }
    }, [isOpen, mode, berkas]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            onSubmit({
                nama_pengajuan: formData.nama_pengajuan,
                jumlah_pengajuan: formData.jumlah_pengajuan,
                jenis_kredit: formData.jenis_kredit,
                no_wa_nasabah: formData.no_wa_nasabah,
                status_berkas: formData.status_berkas,
                catatan: formData.catatan
            });
        } else {
            onSubmit({
                status_berkas: formData.status_berkas,
                catatan: formData.catatan,
                assigned_employee_id: formData.status_berkas === 'lengkap' && berkas?.current_stage === 'delegasi_survey'
                    ? formData.assigned_employee_id
                    : undefined
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={titleOverride || (mode === 'create' ? 'Input Berkas Pengajuan Kredit Baru' : `Proses Berkas: ${berkas?.nama_pengajuan}`)}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                {mode === 'create' ? (
                    <>
                        <Input
                            id="nama_pengajuan"
                            label="Nama Pengajuan (Debitur)"
                            required
                            value={formData.nama_pengajuan}
                            onChange={(e) => setFormData({ ...formData, nama_pengajuan: e.target.value })}
                            placeholder="Masukkan nama nasabah"
                        />
                        <Input
                            id="jumlah_pengajuan"
                            label="Nominal Pengajuan (Rp)"
                            type="number"
                            value={formData.jumlah_pengajuan}
                            onChange={(e) => setFormData({ ...formData, jumlah_pengajuan: Number(e.target.value) })}
                            placeholder="0"
                        />
                        <Input
                            id="no_wa_nasabah"
                            label="No. WhatsApp Nasabah *"
                            required
                            value={formData.no_wa_nasabah}
                            onChange={(e) => setFormData({ ...formData, no_wa_nasabah: e.target.value.replace(/[^0-9+]/g, '') })}
                            placeholder="08xxxxxxxxxx"
                        />
                        <p className="text-xs text-gray-500 -mt-2">
                            Nomor WA nasabah untuk notifikasi status pengajuan kredit
                        </p>
                    </>
                ) : (
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm shadow-inner">
                        <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-semibold">Nomor Berkas:</span>
                            <span className="text-blue-900 font-mono">{berkas?.nomor_pengajuan}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-semibold">Nama Debitur:</span>
                            <span className="text-blue-900 font-bold">{berkas?.nama_pengajuan}</span>
                        </div>
                        <div className="flex justify-between mb-1 text-[11px] border-t border-blue-100 pt-1 mt-1">
                            <span className="text-blue-600 italic">Tahap Saat Ini:</span>
                            <span className="text-blue-800 uppercase font-bold tracking-tight">
                                {berkas?.current_stage ? (STAGE_LABELS[berkas.current_stage] || berkas.current_stage.replace('_', ' ')) : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-blue-600 italic">Nominal Pengajuan:</span>
                            <span className="text-blue-800 font-semibold">Rp {berkas?.jumlah_pengajuan?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {mode === 'create' ? 'Status Kelengkapan Berkas' : `Status Update Tahap ${berkas?.current_stage ? (STAGE_LABELS[berkas.current_stage] || berkas.current_stage.replace('_', ' ')) : ''}`}
                    </label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status_berkas"
                                value="belum_lengkap"
                                checked={formData.status_berkas === 'belum_lengkap'}
                                onChange={() => setFormData({ ...formData, status_berkas: 'belum_lengkap' })}
                                className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm group-hover:text-indigo-600 transition-colors">
                                {mode === 'create' ? 'Belum Lengkap' : 'Masih Proses / Pending'}
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="status_berkas"
                                value="lengkap"
                                checked={formData.status_berkas === 'lengkap'}
                                onChange={() => setFormData({ ...formData, status_berkas: 'lengkap' })}
                                className="text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm font-semibold text-green-700 group-hover:text-green-800 transition-colors">
                                {mode === 'create' ? 'Lengkap (Lanjut Tahap Berikutnya)' : 'Selesai (Lanjut Tahap Berikutnya)'}
                            </span>
                        </label>
                        {mode === 'process' && (
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="status_berkas"
                                    value="ditolak"
                                    checked={formData.status_berkas === 'ditolak'}
                                    onChange={() => setFormData({ ...formData, status_berkas: 'ditolak' })}
                                    className="text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-red-600 group-hover:text-red-700 transition-colors">Ditolak / Batalkan</span>
                            </label>
                        )}
                    </div>
                </div>

                {mode === 'process' && berkas?.current_stage === 'delegasi_survey' && formData.status_berkas === 'lengkap' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <label className="block text-sm font-medium text-gray-700">
                            Delegasikan Survey Ke (Bawahan / Diri Sendiri) <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="assigned_employee_id"
                            value={formData.assigned_employee_id}
                            onChange={(e) => setFormData({ ...formData, assigned_employee_id: e.target.value })}
                            required
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Surveyor --</option>
                            {surveyorOptions.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.position})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <Textarea
                    id="catatan"
                    label="Catatan / Keterangan"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder={mode === 'create' ? "Contoh: Kekurangan KTP, dsb." : "Masukkan catatan perkembangan berkas..."}
                    rows={3}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        className={formData.status_berkas === 'lengkap' ? 'bg-green-600 hover:bg-green-700' : formData.status_berkas === 'ditolak' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600'}
                        disabled={
                            isLoading || 
                            (mode === 'create' && (!formData.nama_pengajuan || !formData.no_wa_nasabah || formData.no_wa_nasabah.length < 10)) ||
                            (mode === 'process' && berkas?.current_stage === 'delegasi_survey' && formData.status_berkas === 'lengkap' && !formData.assigned_employee_id)
                        }
                    >
                        {isLoading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan Berkas Baru' : 'Simpan Perubahan Tahap')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
