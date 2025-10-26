import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTugasOrientasi, buatTugasOrientasi, perbaruiTugasOrientasi, hapusTugasOrientasi } from '../../../shared/services/orientasiAPI';
import { OnboardingTask } from '../../../shared/types/types';

const HalamanOrientasiPegawai: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [loading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Partial<OnboardingTask> | null>(null);

  useEffect(() => {
    if (id) {
      fetchOnboardingTasks(id);
    }
  }, [id]);

  const fetchOnboardingTasks = async (employeeId: string) => {
    try {
      const response = await getOnboardingTasks(employeeId);
      setOnboardingTasks(response.data);
    } catch (err) {
      setError('Gagal mengambil tugas orientasi');
    }
  };

  const handleAddTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: OnboardingTask) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        await deleteOnboardingTask(taskId);
        if (id) fetchOnboardingTasks(id);
      } catch (err) {
        setError('Gagal menghapus tugas');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask || !id) return;

    try {
      if (currentTask.id) {
        await updateOnboardingTask(currentTask.id, currentTask);
      } else {
        await createOnboardingTask(id, { ...currentTask, employee_id: id } as Omit<OnboardingTask, 'id'>);
      }
      fetchOnboardingTasks(id);
      setIsModalOpen(false);
    } catch (err) {
      setError('Gagal menyimpan tugas');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setCurrentTask((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tugas Orientasi untuk Pegawai {id}</h1>
      <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Tambah Tugas</button>

      {onboardingTasks.length === 0 ? (
        <p>Tidak ada tugas orientasi untuk pegawai ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nama Tugas</th>
                <th className="py-2 px-4 border-b">Deskripsi</th>
                <th className="py-2 px-4 border-b">Tanggal Jatuh Tempo</th>
                <th className="py-2 px-4 border-b">Selesai</th>
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {onboardingTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{task.task_name}</td>
                  <td className="py-2 px-4 border-b">{task.description}</td>
                  <td className="py-2 px-4 border-b">{new Date(task.due_date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">{task.completed ? 'Ya' : 'Tidak'}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleEditTask(task)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-1/2">
            <h2 className="text-xl font-bold mb-4">{currentTask?.id ? 'Edit Tugas Orientasi' : 'Tambah Tugas Orientasi'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Nama Tugas</label>
                <input type="text" name="task_name" value={currentTask?.task_name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Deskripsi</label>
                <textarea name="description" value={currentTask?.description || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded"></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Tanggal Jatuh Tempo</label>
                <input type="date" name="due_date" value={currentTask?.due_date ? new Date(currentTask.due_date).toISOString().split('T')[0] : ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="completed" checked={currentTask?.completed || false} onChange={handleChange} className="form-checkbox" />
                  <span className="ml-2">Selesai</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded mr-2">Batal</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanOrientasiPegawai;
