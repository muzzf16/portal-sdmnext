import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { getTasksBySupervisor, createTask, deleteTask } from '../api/taskApi';
import { AssignedTask } from '../../../shared/types/types';
import { Pegawai } from '../../01-pegawai/types';
import { useToast } from '../../../app/providers/ToastContext';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

const ManajemenTugasAtasanPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [subordinates, setSubordinates] = useState<Pegawai[]>([]);
    const [tasks, setTasks] = useState<AssignedTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (user?.employeeId) {
            fetchData(user.employeeId);
        }
    }, [user?.employeeId]);

    const fetchData = async (supervisorId: string) => {
        setIsLoading(true);
        try {
            // Fetch all employees to filter subordinates
            // Ideally backend should have a /subordinates endpoint, but we loop here
            const empRes = await getPegawai();
            if (empRes.data) {
                const subs = empRes.data.filter((p: Pegawai) => p.atasan_id === supervisorId);
                setSubordinates(subs);
            }

            // Fetch tasks assigned by this supervisor
            const taskRes = await getTasksBySupervisor(supervisorId);
            if (taskRes.data?.data) {
                setTasks(taskRes.data.data);
            }
        } catch (error) {
            console.error(error);
            addToast('Gagal memuat data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.employeeId) return;

        setIsSubmitting(true);
        try {
            await createTask({
                supervisor_id: user.employeeId,
                employee_id: selectedEmployee,
                task_name: taskName,
                description
            });
            addToast('Tugas berhasil diberikan', 'success');

            // Reset form
            setTaskName('');
            setDescription('');
            setSelectedEmployee('');

            // Refresh table
            fetchData(user.employeeId);
        } catch (error) {
            console.error(error);
            addToast('Gagal membuat tugas', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm('Hapus tugas ini?')) return;
        try {
            await deleteTask(id);
            addToast('Tugas dihapus', 'success');
            if (user?.employeeId) fetchData(user.employeeId);
        } catch (error) {
            console.error(error);
            addToast('Gagal menghapus tugas', 'error');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Penugasan Bawahan</h1>
            <p className="text-gray-600">Berikan tugas insidental atau harian kepada bawahan Anda.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* FORM PANEL */}
                <div className="md:col-span-1">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Berikan Tugas Baru</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pegawai (Bawahan)</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Pilih Pegawai --</option>
                                    {subordinates.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name} ({sub.position})
                                        </option>
                                    ))}
                                </select>
                                {subordinates.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">Anda tidak memiliki bawahan yang terdaftar (atasan_id).</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul / Nama Tugas</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Contoh: Perbaiki printer ruang rapat"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Tambahan</label>
                                <textarea
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Opsional"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center"
                                disabled={isSubmitting || subordinates.length === 0}
                            >
                                {isSubmitting ? 'Memproses...' : 'Kirim Tugas'}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* TABLE PANEL */}
                <div className="md:col-span-2">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Tugas yang Diberikan</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Penerima</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Tugas</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Belum ada tugas yang diberikan
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map(task => (
                                            <tr key={task.id}>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(task.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{task.employee_name}</div>
                                                    <div className="text-xs text-gray-500">{task.employee_position}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{task.task_name}</div>
                                                    {task.description && <div className="text-xs text-gray-500 mt-1">{task.description}</div>}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {task.status === 'completed' ? 'Selesai' :
                                                            task.status === 'cancelled' ? 'Dibatalkan' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 hover:text-red-900 mx-1"
                                                        title="Hapus"
                                                        disabled={task.status === 'completed'}
                                                    >
                                                        {task.status === 'completed' ? '' : 'Hapus'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ManajemenTugasAtasanPage;
