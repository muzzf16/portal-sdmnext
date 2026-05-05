import React, { useState, useEffect } from 'react';
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

interface KreditBerkasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateKreditBerkasDto | UpdateKreditStageDto) => void;
    mode: 'create' | 'process';
    berkas?: KreditBerkas;
    isLoading?: boolean;
}

export const KreditBerkasModal: React.FC<KreditBerkasModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    berkas,
    isLoading
}) => {
    const [formData, setFormData] = useState({
        nama_pengajuan: '',
        jumlah_pengajuan: 0,
        jenis_kredit: 'Kredit Umum',
        status_berkas: 'belum_lengkap' as BerkasStatus,
        catatan: ''
    });

    useEffect(() => {
        if (mode === 'create') {
            setFormData({
                nama_pengajuan: '',
                jumlah_pengajuan: 0,
                jenis_kredit: 'Kredit Umum',
                status_berkas: 'belum_lengkap',
                catatan: ''
            });
        } else if (berkas) {
            setFormData(prev => ({
                ...prev,
                status_berkas: 'belum_lengkap',
                catatan: ''
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
                status_berkas: formData.status_berkas,
                catatan: formData.catatan
            });
        } else {
            onSubmit({
                status_berkas: formData.status_berkas,
                catatan: formData.catatan
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Input Berkas Pengajuan Kredit Baru' : `Proses Berkas: ${berkas?.nama_pengajuan}`}
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
                    </>
                ) : (
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-semibold">Nomor:</span>
                            <span className="text-blue-900">{berkas?.nomor_pengajuan}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-semibold">Tahap Saat Ini:</span>
                            <span className="text-blue-900 uppercase tracking-tight font-bold">{berkas?.current_stage.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700 font-semibold">Nominal:</span>
                            <span className="text-blue-900">Rp {berkas?.jumlah_pengajuan.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status Kelengkapan Berkas</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status_berkas"
                                value="belum_lengkap"
                                checked={formData.status_berkas === 'belum_lengkap'}
                                onChange={() => setFormData({ ...formData, status_berkas: 'belum_lengkap' })}
                                className="text-indigo-600"
                            />
                            <span className="text-sm">Belum Lengkap</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="status_berkas"
                                value="lengkap"
                                checked={formData.status_berkas === 'lengkap'}
                                onChange={() => setFormData({ ...formData, status_berkas: 'lengkap' })}
                                className="text-green-600"
                            />
                            <span className="text-sm font-semibold text-green-700">Lengkap (Lanjut Tahap Berikutnya)</span>
                        </label>
                        {mode === 'process' && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status_berkas"
                                    value="ditolak"
                                    checked={formData.status_berkas === 'ditolak'}
                                    onChange={() => setFormData({ ...formData, status_berkas: 'ditolak' })}
                                    className="text-red-600"
                                />
                                <span className="text-sm text-red-600">Ditolak / Batalkan</span>
                            </label>
                        )}
                    </div>
                </div>

                <Textarea
                    id="catatan"
                    label="Catatan / Keterangan"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Contoh: Kekurangan KTP, sedang proses SLIK, dsb."
                    rows={3}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        className={formData.status_berkas === 'lengkap' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600'}
                        disabled={isLoading || (mode === 'create' && !formData.nama_pengajuan)}
                    >
                        {isLoading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan Berkas' : 'Update Status Berkas')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
