
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { WorkLoadAnalysis, WorkLoadItem, ActivityLibraryItem } from '../types';
import { saveWorkloadAnalysis, getWorkloadAnalysis } from '../api/workloadApi';
import { getActivityByPosition, createActivity } from '../api/activityLibraryApi';
import { getPegawaiById } from '../../01-pegawai/api/employeeApi';
import { useToast } from '@/app/providers/ToastContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { emitRefresh } from '@/shared/hooks/useDataRefresh';

// Constants for calculation
const DAYS_IN_YEAR = 264;
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;

interface WorkLoadFormProps {
    employeeId: string;
    year: number;
    initialData?: WorkLoadAnalysis | null;
    onSuccess?: () => void;
    onSaved?: () => void;
}

const WorkLoadForm: React.FC<WorkLoadFormProps> = ({ employeeId, year, initialData, onSuccess, onSaved }) => {
    const { register, control, handleSubmit, watch, setValue, reset } = useForm<WorkLoadAnalysis>({
        defaultValues: initialData || {
            employeeId,
            year,
            position: '', // Should be pre-filled
            department: '', // Should be pre-filled
            status: 'draft',
            items: [
                { activityName: '', durationMinutes: 0, freqDaily: 0, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0 },
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { addToast } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libraryActivities, setLibraryActivities] = useState<ActivityLibraryItem[]>([]);

    // Custom Activity State
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const [newActivityForm, setNewActivityForm] = useState({
        activityName: '', durationMinutes: 0, outputUnit: '', category: ''
    });

    // Watch position to fetch library activities
    const position = watch('position');

    // Watch items to calculate total
    const items = watch('items') || [];

    // Fetch library activities when position changes
    useEffect(() => {
        if (position && position.length > 1) {
            getActivityByPosition(position).then(res => {
                setLibraryActivities(res.data?.data || []);
            }).catch(() => setLibraryActivities([]));
        }
    }, [position]);


    const calculateItemTotal = (item: WorkLoadItem) => {
        return (item.durationMinutes || 0) * (
            (item.freqDaily || 0) * DAYS_IN_YEAR +
            (item.freqWeekly || 0) * WEEKS_IN_YEAR +
            (item.freqMonthly || 0) * MONTHS_IN_YEAR +
            (item.freqQuarterly || 0) * 4 +
            (item.freqSemester || 0) * 2 +
            (item.freqYearly || 0)
        );
    };

    const totalMinutes = useMemo(() => {
        return items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) || 0;
    }, [items]);

    // Update total in form state
    useEffect(() => {
        setValue('totalYearlyMinutes', totalMinutes);
    }, [totalMinutes, setValue]);

    // Effect to load data if initialData is not provided but employeeId/year is valid
    useEffect(() => {
        if (!initialData && employeeId) {
            const fetchAndPrefill = async () => {
                let wlaData: any = null;
                try {
                    const res = await getWorkloadAnalysis(employeeId, year);
                    const responseData = res.data?.data;

                    if (responseData && (responseData.id || (responseData.items && responseData.items.length > 0))) {
                        wlaData = responseData;
                    }
                } catch (err) {
                    // API might throw 404 if not found
                    console.log('WLA record not found, will pre-fill from employee profile');
                }

                // Always fetch employee profile to ensure position/department are correct
                let empPosition = '';
                let empDepartment = '';
                try {
                    const empRes = await getPegawaiById(employeeId);
                    if (empRes.data) {
                        empPosition = empRes.data.position || '';
                        empDepartment = empRes.data.department || '';
                    }
                } catch (empErr) {
                    console.error('Failed to fetch employee data', empErr);
                }

                if (wlaData) {
                    // Always sync with current profile to prevent discrepancies like "Staf KREDIT" vs "Staf Adm Kredit"
                    if (empPosition) wlaData.position = empPosition;
                    if (empDepartment) wlaData.department = empDepartment;
                    reset(wlaData);
                } else {
                    // No WLA record, just set position/department from employee profile
                    setValue('position', empPosition);
                    setValue('department', empDepartment);
                }
            };
            fetchAndPrefill();
        }
    }, [employeeId, year, initialData, reset, setValue]);

    const onSubmit = async (data: WorkLoadAnalysis) => {
        setIsSubmitting(true);
        // Ensure employeeId and year are included in the payload
        const payload = {
            ...data,
            employeeId,
            year
        };
        try {
            await saveWorkloadAnalysis(payload);
            addToast('Laporan kerja berhasil disimpan', 'success');
            if (onSuccess) onSuccess();
            if (onSaved) onSaved();
            emitRefresh('workload');
        } catch (error) {
            console.error(error);
            addToast('Gagal menyimpan laporan kerja', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateActivity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!position || !watch('department')) {
            addToast('Posisi dan Departemen harus terisi', 'error');
            return;
        }

        setIsCreatingActivity(true);
        try {
            const payload = {
                ...newActivityForm,
                position: position,
                department: watch('department')
            };

            const res = await createActivity(payload as any);
            const createdActivity = res.data?.data;

            addToast('Aktivitas berhasil ditambahkan ke library', 'success');
            emitRefresh('activity-library');

            // Add to local library state
            if (createdActivity) {
                setLibraryActivities(prev => [...prev, createdActivity]);

                // Automatically append to ABK list
                append({
                    activityId: createdActivity.id,
                    activityName: createdActivity.activityName,
                    outputUnit: createdActivity.outputUnit,
                    durationMinutes: createdActivity.durationMinutes,
                    freqDaily: 0, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0
                });
            }

            // Reset form and close
            setNewActivityForm({ activityName: '', durationMinutes: 0, outputUnit: '', category: '' });
            setShowAddActivity(false);

        } catch (error) {
            console.error(error);
            addToast('Gagal membuat aktivitas baru', 'error');
        } finally {
            setIsCreatingActivity(false);
        }
    };

    const grandTotalHours = (totalMinutes / 60).toFixed(2);
    const BebanKerjaHarian = (totalMinutes / DAYS_IN_YEAR / 60).toFixed(2); // Jam per hari

    const formStatus = watch('status');
    const isReadOnly = formStatus === 'submitted';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">A. Informasi Umum</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tahun</label>
                        <input type="number" {...register('year')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Posisi</label>
                        <input {...register('position')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50 text-gray-500" placeholder="Auto-filled" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Departemen/Divisi</label>
                        <input {...register('department')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50 text-gray-500" placeholder="Auto-filled" readOnly />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                <h3 className="text-lg font-medium mb-4">B. Daftar Kegiatan dan Waktu Pengerjaan</h3>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-blue-50">
                        <tr>
                            <th rowSpan={2} className="px-3 py-2 text-left font-medium text-gray-500">No</th>
                            <th rowSpan={2} className="px-3 py-2 text-left font-medium text-gray-500 w-1/3">Aktivitas/Kegiatan</th>
                            <th rowSpan={2} className="px-3 py-2 text-center font-medium text-gray-500">Durasi (menit)</th>
                            <th colSpan={6} className="px-3 py-2 text-center font-medium text-gray-500 border-b border-gray-300">Frekuensi</th>
                            <th rowSpan={2} className="px-3 py-2 text-right font-medium text-gray-500">Total (menit)</th>
                            <th rowSpan={2} className="px-3 py-2"></th>
                        </tr>
                        <tr>
                            <th className="px-2 py-1 text-center">Harian <br /><span className="text-xs text-gray-400">x{DAYS_IN_YEAR}</span></th>
                            <th className="px-2 py-1 text-center">Mingguan <br /><span className="text-xs text-gray-400">x{WEEKS_IN_YEAR}</span></th>
                            <th className="px-2 py-1 text-center">Bulanan <br /><span className="text-xs text-gray-400">x{MONTHS_IN_YEAR}</span></th>
                            <th className="px-2 py-1 text-center">Triwulan <br /><span className="text-xs text-gray-400">x4</span></th>
                            <th className="px-2 py-1 text-center">Semester <br /><span className="text-xs text-gray-400">x2</span></th>
                            <th className="px-2 py-1 text-center">Tahunan <br /><span className="text-xs text-gray-400">x1</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fields.map((item, index) => {
                            const currentItem = items[index] || item;
                            const rowTotal = calculateItemTotal(currentItem as any);
                            return (
                                <tr key={item.id}>
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">
                                        <input {...register(`items.${index}.activityName` as const, { required: true })} disabled={isReadOnly} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-1 disabled:bg-gray-100 disabled:text-gray-600" placeholder="Nama aktivitas" />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input type="number" min="0" {...register(`items.${index}.durationMinutes` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-16 text-center border-gray-300 rounded-md shadow-sm sm:text-sm border p-1 disabled:bg-gray-100 disabled:text-gray-600" />
                                    </td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqDaily` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqWeekly` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqMonthly` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqQuarterly` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqSemester` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-1 py-2"><input type="number" min="0" {...register(`items.${index}.freqYearly` as const, { valueAsNumber: true })} disabled={isReadOnly} className="w-12 text-center border-gray-300 rounded-md border p-1 disabled:bg-gray-100 disabled:text-gray-600" /></td>
                                    <td className="px-3 py-2 text-right font-mono text-gray-900 font-medium bg-gray-50">
                                        {rowTotal.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {!isReadOnly && (
                                            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                                &times;
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                        <tr>
                            <td colSpan={3} className="px-3 py-2 text-right">Total Beban Kerja (menit/tahun)</td>
                            <td colSpan={6}></td>
                            <td className="px-3 py-2 text-right">{totalMinutes.toLocaleString()}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="px-3 py-2 text-right">Total Jam Kerja / Tahun</td>
                            <td colSpan={6}></td>
                            <td className="px-3 py-2 text-right">{grandTotalHours}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="px-3 py-2 text-right">Beban Kerja (Jam/Hari)</td>
                            <td colSpan={6}></td>
                            <td className="px-3 py-2 text-right bg-yellow-100 text-yellow-800">{BebanKerjaHarian}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-4 flex justify-between items-start gap-4 flex-wrap">
                    {!isReadOnly && (
                        <div className="flex gap-2 items-center">
                            <button type="button" onClick={() => setShowAddActivity(!showAddActivity)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors">
                                {showAddActivity ? '- Batal Tambah Baris' : '+ Tambah Baris'}
                            </button>
                            {libraryActivities.length > 0 && (
                                <select
                                    onChange={(e) => {
                                        const act = libraryActivities.find(a => a.id === e.target.value);
                                        if (act) {
                                            append({
                                                activityId: act.id,
                                                activityName: act.activityName,
                                                outputUnit: act.outputUnit,
                                                durationMinutes: act.durationMinutes,
                                                freqDaily: 0, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0
                                            });
                                            e.target.value = '';
                                        }
                                    }}
                                    className="border border-green-500 text-green-700 rounded px-3 py-2 text-sm bg-green-50 hover:bg-green-100"
                                    defaultValue=""
                                >
                                    <option value="" disabled>📚 Pilih dari Library ({position})</option>
                                    {libraryActivities.map((act, idx) => (
                                        <option key={act.id || `act-${idx}`} value={act.id || idx}>{act.activityName} ({act.durationMinutes} mnt)</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </div>

                {/* Inline Add Activity Form */}
                {showAddActivity && !isReadOnly && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner p-6">
                        <h4 className="text-md font-bold text-blue-900 mb-3">Tambah Aktivitas Baru ke Library</h4>
                        <p className="text-xs text-blue-700 mb-4">Aktivitas ini akan disimpan ke dalam Perpustakaan Aktivitas untuk posisi <strong>{position}</strong> dan otomatis ditambahkan ke form ABK Anda.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aktivitas *</label>
                                <input
                                    value={newActivityForm.activityName}
                                    onChange={e => setNewActivityForm({ ...newActivityForm, activityName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                    placeholder="Contoh: Menyusun laporan bulanan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit) *</label>
                                <input
                                    type="number"
                                    value={newActivityForm.durationMinutes === 0 ? '' : newActivityForm.durationMinutes}
                                    onChange={e => setNewActivityForm({ ...newActivityForm, durationMinutes: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Output</label>
                                <input
                                    value={newActivityForm.outputUnit}
                                    onChange={e => setNewActivityForm({ ...newActivityForm, outputUnit: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    placeholder="Contoh: Dokumen"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    value={newActivityForm.category}
                                    onChange={e => setNewActivityForm({ ...newActivityForm, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Pilih Kategori...</option>
                                    <option value="operasional">Operasional</option>
                                    <option value="administrasi">Administrasi</option>
                                    <option value="lapangan">Lapangan</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddActivity(false)}
                                className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50 text-gray-700 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateActivity}
                                disabled={isCreatingActivity || !newActivityForm.activityName || newActivityForm.durationMinutes <= 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 font-medium disabled:bg-blue-300 transition-colors"
                            >
                                {isCreatingActivity ? 'Menyimpan...' : 'Simpan & Tambahkan'}
                            </button>
                        </div>
                    </div>
                )}

                {isReadOnly && user?.role === 'admin' && (
                    <div className="mt-6 flex justify-end items-start gap-4">
                        <button
                            type="button"
                            onClick={() => { setValue('status', 'draft', { shouldValidate: true }); handleSubmit(onSubmit)(); }}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-red-300 text-red-600 bg-red-50 rounded hover:bg-red-100 font-medium transition-colors"
                        >
                            🔓 Buka Kunci Laporan (Kembalikan ke Draft)
                        </button>
                    </div>
                )}

                {!isReadOnly && (
                    <div className="mt-6 flex justify-end items-start gap-4">
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={() => { setValue('status', 'draft', { shouldValidate: true }); handleSubmit(onSubmit)(); }}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 bg-white"
                            >
                                Simpan Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => { setValue('status', 'submitted', { shouldValidate: true }); handleSubmit(onSubmit)(); }}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

export default WorkLoadForm;
