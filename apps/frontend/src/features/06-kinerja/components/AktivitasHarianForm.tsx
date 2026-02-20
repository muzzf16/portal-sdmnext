import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { createDailyActivity } from '../api/dailyActivityApi';
import { Plus, X, Clock } from 'lucide-react';
// import { getActivityLibrary } from '../api/activityLibraryApi'; // Optional integration later

interface AktivitasHarianFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const AktivitasHarianForm: React.FC<AktivitasHarianFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        activityName: '',
        tanggal: new Date().toISOString().split('T')[0],
        jam_mulai: '',
        jam_selesai: '',
        evidenceUrl: '',
        catatan: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateDuration = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startTime = new Date(`1970-01-01T${start}`);
        const endTime = new Date(`1970-01-01T${end}`);
        const diffMs = endTime.getTime() - startTime.getTime();
        return Math.max(0, Math.floor(diffMs / 60000)); // returns minutes
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user?.employeeId) {
            setError("Data pegawai tidak ditemukan.");
            return;
        }

        const durasiMenit = calculateDuration(formData.jam_mulai, formData.jam_selesai);
        if (durasiMenit <= 0) {
            setError("Jam selesai harus lebih besar dari jam mulai.");
            return;
        }

        setLoading(true);
        try {
            await createDailyActivity({
                id_pegawai: Number(user.employeeId),
                activityName: formData.activityName,
                tanggal: formData.tanggal,
                jam_mulai: formData.jam_mulai,
                jam_selesai: formData.jam_selesai,
                durasiMenit,
                evidenceUrl: formData.evidenceUrl,
                catatan: formData.catatan,
                status: 'pending'
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan aktivitas harian.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border border-gray-100 p-6">
            <div className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <Plus className="mr-2 h-5 w-5 text-indigo-600" />
                    Catat Aktivitas Baru
                </h2>
                <Button variant="outline" size="sm" onClick={onCancel} className="h-8 w-8 p-0 rounded-full flex items-center justify-center">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div>
                {error && (
                    <div className="mb-4 bg-red-50 p-3 rounded-md text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Input
                                label="Nama Aktivitas"
                                id="activityName"
                                name="activityName"
                                value={formData.activityName}
                                onChange={handleChange}
                                placeholder="Contoh: Maintenance Server Bulanan"
                                required
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ketik aktivitas atau sesuaikan dengan target KPI Anda.</p>
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Tanggal"
                                id="tanggal"
                                name="tanggal"
                                type="date"
                                value={formData.tanggal}
                                onChange={handleChange}
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            {/* Spacer to align with Date, or can be used for KPI Target linking in future */}
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Jam Mulai"
                                id="jam_mulai"
                                name="jam_mulai"
                                type="time"
                                value={formData.jam_mulai}
                                onChange={handleChange}
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Jam Selesai"
                                id="jam_selesai"
                                name="jam_selesai"
                                type="time"
                                value={formData.jam_selesai}
                                onChange={handleChange}
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formData.jam_mulai && formData.jam_selesai && (
                        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded border border-blue-100 mt-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Durasi terhitung: <strong>{calculateDuration(formData.jam_mulai, formData.jam_selesai)} menit</strong>
                        </div>
                    )}

                    <div className="space-y-2 border-t pt-4 mt-2">
                        <Input
                            label="Link Bukti (Evidence URL)"
                            id="evidenceUrl"
                            name="evidenceUrl"
                            type="url"
                            value={formData.evidenceUrl}
                            onChange={handleChange}
                            placeholder="https://drive.google.com/..."
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Opsional: Tautkan bukti pekerjaan seperti foto, dokumen, atau geo-tag.</p>
                    </div>

                    <div className="space-y-2 mt-4">
                        <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Catatan Singkat (Opsional)
                        </label>
                        <textarea
                            id="catatan"
                            name="catatan"
                            rows={3}
                            value={formData.catatan}
                            onChange={handleChange}
                            className="w-full flex rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Detail tambahan mengenai tugas hari ini..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? 'Menyimpan...' : 'Simpan Aktivitas'}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default AktivitasHarianForm;
