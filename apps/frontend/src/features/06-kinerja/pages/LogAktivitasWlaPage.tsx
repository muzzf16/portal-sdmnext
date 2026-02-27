import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { List, Clock, Save, Activity as ActivityIcon } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useToast } from '@/app/providers/ToastContext';
import { getMyLogAktivitasWla, createBulkLogAktivitasWla } from '../api/logAktivitasHarianApi';
import { getTasksByEmployee, updateTaskStatus } from '../api/taskApi';
import { getActivityLibrary } from '../api/activityLibraryApi';
import { LogAktivitasHarian, ActivityLibraryItem } from '../types';
import { AssignedTask } from '../../../shared/types/types';
import clsx from 'clsx';

const LogAktivitasWlaPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [myLogs, setMyLogs] = useState<LogAktivitasHarian[]>([]);
    const [library, setLibrary] = useState<ActivityLibraryItem[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Map of activity ID to { frekuensi, catatan, file }
    const [formInputs, setFormInputs] = useState<Record<string, { frekuensi: number | string, catatan: string, file?: File | null }>>({});

    // Task Modal state
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [activeTask, setActiveTask] = useState<AssignedTask | null>(null);
    const [taskModalForm, setTaskModalForm] = useState({
        id_activity_library: '',
        frekuensi: 1,
        catatan: '',
        file: null as File | null
    });

    const fetchMyLogs = async () => {
        if (!user?.employeeId && !user?.id) return;
        setLoadingLogs(true);
        setError(null);
        try {
            const res = await getMyLogAktivitasWla(selectedDate);
            const fetchedData = res?.data?.data || [];
            setMyLogs(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat data log harian WLA.');
        } finally {
            setLoadingLogs(false);
        }
    };

    const fetchLibrary = async () => {
        setLoadingLibrary(true);
        try {
            // Fetch only activities relevant to the employee's position
            const userPosition = user?.employeeDetails?.position || (user as any)?.position || undefined;
            const res = await getActivityLibrary(userPosition ? { position: userPosition } : {});
            const fetchedData = res?.data?.data || [];

            setLibrary(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat daftar Norma Waktu.');
        } finally {
            setLoadingLibrary(false);
        }
    };

    const fetchTasks = async () => {
        if (!user?.employeeId && !user?.id) return;
        setLoadingTasks(true);
        try {
            const res = await getTasksByEmployee(user?.employeeId || user?.id as string, 'pending');
            const fetchedData = res?.data?.data || [];
            setAssignedTasks(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (err) {
            console.error("Gagal memuat tugas", err);
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        fetchMyLogs();
        fetchTasks();
    }, [user, selectedDate]);

    useEffect(() => {
        fetchLibrary();
    }, []);



    // Pre-fill form inputs whenever myLogs changes (e.g. initial load or after changing date)
    useEffect(() => {
        if (myLogs && myLogs.length > 0) {
            const newFormInputs: Record<string, { frekuensi: number | string, catatan: string }> = {};
            myLogs.forEach(log => {
                newFormInputs[String(log.id_activity_library)] = {
                    frekuensi: log.frekuensi,
                    catatan: log.catatan || ''
                };
            });
            setFormInputs(newFormInputs);
        } else {
            setFormInputs({});
        }
    }, [myLogs]);

    const handleInputChange = (id: string, field: 'frekuensi' | 'catatan' | 'file', value: any) => {
        setFormInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                frekuensi: prev[id]?.frekuensi || 0,
                catatan: prev[id]?.catatan || '',
                file: prev[id]?.file || null,
                [field]: value
            }
        }));
    };

    const handleBulkSubmit = async () => {
        const payloadLogs = Object.entries(formInputs)
            .filter(([_, data]) => Number(data.frekuensi) > 0)
            .map(([id, data]) => ({
                id_activity_library: id,
                frekuensi: Number(data.frekuensi),
                catatan: data.catatan,
                file: data.file
            }));

        if (payloadLogs.length === 0) {
            addToast("Tidak ada aktivitas yang diisi frekuensinya.", "error");
            return;
        }

        const employeeId = user?.employeeId || user?.id;

        if (!employeeId) {
            addToast("ID Pegawai tidak ditemukan. Silakan login ulang.", "error");
            return;
        }

        setSubmitting(true);
        try {
            await createBulkLogAktivitasWla({
                id_pegawai: String(employeeId),
                tanggal: selectedDate,
                logs: payloadLogs
            });
            addToast(`Berhasil! ${payloadLogs.length} aktivitas berhasil disimpan.`, "success");
            fetchMyLogs();
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Gagal menyimpan log massal.', "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelesaikanTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTask || !taskModalForm.id_activity_library) return;

        const employeeId = user?.employeeId || user?.id;
        if (!employeeId) return;

        setSubmitting(true);
        try {
            // 1. Buat log harian
            await createBulkLogAktivitasWla({
                id_pegawai: String(employeeId),
                tanggal: selectedDate,
                logs: [{
                    id_activity_library: taskModalForm.id_activity_library,
                    frekuensi: Number(taskModalForm.frekuensi),
                    catatan: taskModalForm.catatan,
                    file: taskModalForm.file
                }]
            });

            // 2. Tandai tugas selesai
            await updateTaskStatus(activeTask.id, 'completed');

            addToast('Tugas diselesaikan dan masuk log aktivitas!', 'success');
            setOpenTaskModal(false);
            fetchTasks();
            fetchMyLogs();
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Gagal menyelesaikan tugas.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const totalDurasi = useMemo(() => myLogs.reduce((sum, act) => sum + act.total_durasi_terhitung, 0), [myLogs]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <ActivityIcon className="mr-2 h-6 w-6 text-indigo-600" />
                        Log Beban Kerja (WLA)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Catatan checklist aktivitas harian berdasarkan Norma Waktu (ABK).
                    </p>
                </div>
                <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm flex items-center mt-4 sm:mt-0">
                    <label className="text-sm font-medium text-gray-700 mr-3">Tanggal:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none focus:ring-0 text-sm text-indigo-700 font-semibold cursor-pointer p-0"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-md text-sm text-red-600 border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT COLUMN: TASKS + CHECKLIST */}
                <div className="flex flex-col gap-6 h-[700px]">

                    {/* ASSIGNED TASKS SECTION */}
                    {assignedTasks.length > 0 && (
                        <Card className="shadow-soft-shadow border-t-4 border-t-amber-500 flex-shrink-0">
                            <div className="bg-amber-50 border-b border-amber-100 p-4 flex justify-between items-center rounded-t-lg">
                                <h2 className="text-sm font-semibold text-amber-900 flex items-center">
                                    <ActivityIcon className="mr-2 h-4 w-4" />
                                    Tugas dari Atasan ({assignedTasks.length})
                                </h2>
                            </div>
                            <div className="p-4 max-h-48 overflow-y-auto bg-white rounded-b-lg divide-y divide-gray-100">
                                {assignedTasks.map(task => (
                                    <div key={task.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">{task.task_name}</h4>
                                            {task.description && <p className="text-xs text-gray-500 mt-1">{task.description}</p>}
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                                                Dari: {task.supervisor_name}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-amber-600 hover:bg-amber-700 whitespace-nowrap"
                                            onClick={() => {
                                                setActiveTask(task);
                                                setTaskModalForm(prev => ({ ...prev, catatan: 'Tugas: ' + task.task_name }));
                                                setOpenTaskModal(true);
                                            }}
                                        >
                                            Selesaikan
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* CHECKLIST SECTION */}
                    <Card className="shadow-soft-shadow border-t-4 border-t-indigo-500 flex flex-col flex-1 min-h-0">
                        <div className="bg-gray-50 border-b p-4 flex justify-between items-center rounded-t-lg">
                            <h2 className="text-lg font-semibold text-gray-800">Checklist Aktivitas</h2>
                            <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-white border rounded">
                                {library.length} Item Tersedia
                            </span>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            {loadingLibrary ? (
                                <div className="flex justify-center py-10">
                                    <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {library.map((act, index) => {
                                        const actId = String(act.id || '');
                                        const val = formInputs[actId] || { frekuensi: '', catatan: '', file: null };
                                        return (
                                            <div key={act.id || `act-${index}`} className="border border-gray-200 p-4 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-bold text-gray-900">{act.activityName}</h3>
                                                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{act.category || 'Umum'}</span>
                                                            <span className="text-indigo-600 font-medium">{act.durationMinutes} Menit / {act.outputUnit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center">
                                                        <label className="text-xs text-gray-500 mr-2">Frekuensi:</label>
                                                        <div className="flex rounded-md shadow-sm w-24">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={val.frekuensi}
                                                                onChange={(e) => handleInputChange(actId, 'frekuensi', e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full text-center"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {Number(val.frekuensi) > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-100 border-dashed animate-in fade-in slide-in-from-top-2">
                                                        <input
                                                            type="text"
                                                            value={val.catatan}
                                                            onChange={(e) => handleInputChange(actId, 'catatan', e.target.value)}
                                                            placeholder="Catatan opsional..."
                                                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 mb-2"
                                                        />
                                                        <div className="flex items-center text-xs">
                                                            <label className="text-gray-500 font-medium mr-2">Upload Berkas:</label>
                                                            <input
                                                                type="file"
                                                                className="text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                                onChange={(e) => handleInputChange(actId, 'file', e.target.files ? e.target.files[0] : null)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                            <Button
                                onClick={handleBulkSubmit}
                                disabled={submitting || loadingLibrary}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 justify-center h-12 text-base"
                            >
                                {submitting ? 'Menyimpan...' : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" /> Simpan Aktivitas Terpilih
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* HISTORY SECTION */}
                <Card className="shadow-soft-shadow border-t-4 border-t-emerald-500 flex flex-col h-[700px]">
                    <div className="bg-gray-50 border-b p-4 flex justify-between items-center rounded-t-lg">
                        <h2 className="text-lg font-semibold text-gray-800">Riwayat Hari Ini</h2>
                        <div className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-800 text-xs font-bold flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {totalDurasi} Menit
                        </div>
                    </div>
                    <div className="p-0 flex-1 overflow-y-auto">
                        {loadingLogs ? (
                            <div className="flex justify-center py-10">
                                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></span>
                            </div>
                        ) : myLogs.length === 0 ? (
                            <div className="text-center p-12">
                                <List className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-sm font-medium text-gray-900 mb-1">Belum ada aktivitas dilaporkan</h3>
                                <p className="text-xs text-gray-500">Isi checklist di sebelah kiri untuk hari ini.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {myLogs.map((log, index) => (
                                    <li key={log.id_log || `log-${index}`} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800">{log.activityName}</h4>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                                                        {log.frekuensi}x
                                                    </span>
                                                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                                                        {log.total_durasi_terhitung} Menit
                                                    </span>
                                                </div>
                                                {log.catatan && (
                                                    <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                                                        "{log.catatan}"
                                                    </p>
                                                )}
                                                {log.lampiran && (
                                                    <div className="mt-2">
                                                        <a href={log.lampiran} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                            Lihat Lampiran Berkas
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <span className={clsx(
                                                    "px-2 py-0.5 text-[10px] font-bold uppercase rounded-full inline-flex items-center whitespace-nowrap",
                                                    log.status_approval === 'approved' && "bg-green-100 text-green-700",
                                                    log.status_approval === 'pending' && "bg-yellow-100 text-yellow-700",
                                                    log.status_approval === 'rejected' && "bg-red-100 text-red-700"
                                                )}>
                                                    {log.status_approval}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>
            </div>

            {/* TASK MODAL */}
            {openTaskModal && activeTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Selesaikan Tugas</h3>
                            <button onClick={() => setOpenTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSelesaikanTask}>
                            <div className="p-6 space-y-4">
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-md mb-4">
                                    <p className="text-sm font-semibold text-amber-900">{activeTask.task_name}</p>
                                    {activeTask.description && <p className="text-xs text-amber-700 mt-1">{activeTask.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Norma Waktu / Aktivitas (WLA)</label>
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-amber-500 focus:border-amber-500"
                                        required
                                        value={taskModalForm.id_activity_library}
                                        onChange={e => setTaskModalForm(prev => ({ ...prev, id_activity_library: e.target.value }))}
                                    >
                                        <option value="" disabled>-- Pilih Aktivitas --</option>
                                        {library.map(lib => (
                                            <option key={lib.id} value={lib.id}>
                                                {lib.activityName} ({lib.durationMinutes} mnt)
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Pilih aktivitas rutin yang paling mewakili/mirip dengan tugas ini agar bisa dihitung beban kerjanya.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi</label>
                                        <input
                                            type="number"
                                            required min="1"
                                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-amber-500 focus:border-amber-500"
                                            value={taskModalForm.frekuensi}
                                            onChange={e => setTaskModalForm(prev => ({ ...prev, frekuensi: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Bekerja (Opsional)</label>
                                        <input
                                            type="file"
                                            className="w-full text-xs"
                                            onChange={e => setTaskModalForm(prev => ({ ...prev, file: e.target.files ? e.target.files[0] : null }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <textarea
                                        className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-amber-500 focus:border-amber-500"
                                        rows={2}
                                        value={taskModalForm.catatan}
                                        onChange={e => setTaskModalForm(prev => ({ ...prev, catatan: e.target.value }))}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Otomatis terisi dengan nama tugas dari atasan.</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                                <Button type="button" variant="outline" onClick={() => setOpenTaskModal(false)}>Batal</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : 'Simpan & Selesaikan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogAktivitasWlaPage;
