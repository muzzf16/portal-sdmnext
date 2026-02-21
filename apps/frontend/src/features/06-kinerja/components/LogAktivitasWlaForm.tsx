import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Save, X, Activity } from 'lucide-react';
import { createLogAktivitasWla } from '../api/logAktivitasHarianApi';
import { getActivityLibrary } from '../api/activityLibraryApi';
import { ActivityLibraryItem } from '../types';
import { useAuth } from '../../../shared/contexts/AuthContext';
import clsx from 'clsx';

interface LogAktivitasWlaFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    selectedDate: string;
}

const LogAktivitasWlaForm: React.FC<LogAktivitasWlaFormProps> = ({ onSuccess, onCancel, selectedDate }) => {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: {
            id_activity_library: '',
            frekuensi: 1,
            catatan: ''
        }
    });

    const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedActivityId = watch('id_activity_library');
    const frekuensi = watch('frekuensi');

    const selectedActivity = activities.find(a => a.id?.toString() === selectedActivityId);

    // Auto-calculate expected WLA duration
    const calculatedDuration = selectedActivity && frekuensi
        ? (selectedActivity.durationMinutes * Number(frekuensi))
        : 0;

    useEffect(() => {
        const fetchActivities = async () => {
            setFetchLoading(true);
            try {
                // In a real app, you might want to filter by user's position
                // For now, getting all or fetching by the user's known position if available
                const response = await getActivityLibrary({});
                const fetchedData = response?.data?.data || [];
                setActivities(Array.isArray(fetchedData) ? fetchedData : []);
            } catch (err) {
                console.error("Failed to fetch activity library", err);
                setError("Gagal memuat daftar Norma Waktu.");
            } finally {
                setFetchLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const onSubmit = async (data: any) => {
        if (!user?.employeeId && !user?.id) {
            setError("Data user tidak lengkap.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await createLogAktivitasWla({
                id_activity_library: Number(data.id_activity_library),
                tanggal: selectedDate,
                frekuensi: Number(data.frekuensi),
                catatan: data.catatan
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan log aktivitas.');
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-indigo-100 border">
            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 rounded-t-lg flex items-center">
                <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-indigo-900">
                    Input Log Aktivitas WLA ({selectedDate})
                </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {error && (
                    <div className="mb-4 bg-red-50 p-3 rounded-md text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aktivitas (Norma Waktu) *</label>
                        {fetchLoading ? (
                            <div className="p-2 border rounded-md text-sm text-gray-500 bg-gray-50">Memuat data norma waktu...</div>
                        ) : (
                            <select
                                {...register('id_activity_library', { required: 'Pilih aktivitas' })}
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm",
                                    errors.id_activity_library ? "border-red-300" : "border-gray-300"
                                )}
                            >
                                <option value="">-- Pilih Aktivitas --</option>
                                {activities.map((act) => (
                                    <option key={act.id} value={act.id}>
                                        [{act.position}] {act.activityName} ({act.durationMinutes} mnt / {act.outputUnit})
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.id_activity_library && <p className="mt-1 text-xs text-red-500">{errors.id_activity_library.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frekuensi *</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                min="1"
                                {...register('frekuensi', { required: 'Masukan frekuensi', min: 1 })}
                                className={clsx(
                                    "flex-1 px-3 py-2 border rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 text-sm",
                                    errors.frekuensi ? "border-red-300" : "border-gray-300"
                                )}
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                {selectedActivity ? selectedActivity.outputUnit : 'Kali'}
                            </span>
                        </div>
                        {errors.frekuensi && <p className="mt-1 text-xs text-red-500">{errors.frekuensi.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Beban Terhitung</label>
                        <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-800 font-semibold text-sm flex items-center h-[38px]">
                            {calculatedDuration} Menit
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Dihitung dari Frekuensi x Durasi Standar.</p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan (Opsional)</label>
                        <textarea
                            {...register('catatan')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Contoh: Menangani komplain nasabah prioritas..."
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="border-gray-300">
                        <X className="w-4 h-4 mr-2" /> Batal
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                        {loading ? (
                            <span className="flex items-center">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Menyimpan...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Simpan Log
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default LogAktivitasWlaForm;
