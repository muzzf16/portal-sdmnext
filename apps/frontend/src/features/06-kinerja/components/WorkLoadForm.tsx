
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { WorkLoadAnalysis, WorkLoadItem } from '../types';
import { saveWorkloadAnalysis, getWorkloadAnalysis } from '../api/workloadApi';
import { useToast } from '@/app/providers/ToastContext';
// import { useAuth } from '@/app/providers/AuthProvider'; // Assuming this exists

// Constants for calculation
const DAYS_IN_YEAR = 264;
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;

interface WorkLoadFormProps {
    employeeId: string;
    year: number;
    initialData?: WorkLoadAnalysis | null;
    onSuccess?: () => void;
}

const WorkLoadForm: React.FC<WorkLoadFormProps> = ({ employeeId, year, initialData, onSuccess }) => {
    const { register, control, handleSubmit, watch, setValue, reset } = useForm<WorkLoadAnalysis>({
        defaultValues: initialData || {
            employeeId,
            year,
            position: '', // Should be pre-filled
            department: '', // Should be pre-filled
            status: 'draft',
            items: [
                { activityName: 'Doa pagi dan pengarahan', durationMinutes: 30, freqDaily: 1, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0 },
                { activityName: 'Menyalakan komputer CS dan printer CS', durationMinutes: 1, freqDaily: 1, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0 },
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Watch items to calculate total
    const items = watch('items') || [];


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
            getWorkloadAnalysis(employeeId, year).then(res => {
                if (res.data) {
                    reset(res.data);
                }
            }).catch(err => console.error(err));
        }
    }, [employeeId, year, initialData, reset]);


    const onSubmit = async (data: WorkLoadAnalysis) => {
        setIsSubmitting(true);
        try {
            await saveWorkloadAnalysis(data);
            addToast('Laporan kerja berhasil disimpan', 'success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            addToast('Gagal menyimpan laporan kerja', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const grandTotalHours = (totalMinutes / 60).toFixed(2);
    const BebanKerjaHarian = (totalMinutes / DAYS_IN_YEAR / 60).toFixed(2); // Jam per hari


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
                        <input {...register('position')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="e.g. Teller" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Departemen/Divisi</label>
                        <input {...register('department')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2" placeholder="e.g. Operasional" />
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
                                        <input {...register(`items.${index}.activityName` as const, { required: true })} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-1" placeholder="Nama aktivitas" />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input type="number" {...register(`items.${index}.durationMinutes` as const, { valueAsNumber: true })} className="w-16 text-center border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" />
                                    </td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqDaily` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqWeekly` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqMonthly` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqQuarterly` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqSemester` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-1 py-2"><input type="number" {...register(`items.${index}.freqYearly` as const, { valueAsNumber: true })} className="w-12 text-center border-gray-300 rounded-md border p-1" /></td>
                                    <td className="px-3 py-2 text-right font-mono">
                                        {rowTotal.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                            &times;
                                        </button>
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

                <div className="mt-4 flex justify-between">
                    <button type="button" onClick={() => append({ activityName: '', durationMinutes: 0, freqDaily: 0, freqWeekly: 0, freqMonthly: 0, freqQuarterly: 0, freqSemester: 0, freqYearly: 0 })} className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
                        + Tambah Baris
                    </button>
                    <div className="space-x-2">
                        <button type="button" className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Draft</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default WorkLoadForm;
