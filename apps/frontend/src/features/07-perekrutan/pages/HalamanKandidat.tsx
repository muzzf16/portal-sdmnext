import React, { useEffect, useState } from 'react';
import { getKandidat, buatKandidat, perbaruiKandidat, hapusKandidat } from '../../../shared/services/perekrutanAPI';
import { Candidate } from '../../../shared/types/types';

const HalamanKandidat: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await getCandidates();
      setCandidates(response.data);
    } catch (err) {
      setError('Gagal mengambil kandidat');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = () => {
    setCurrentCandidate(null);
    setIsModalOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setCurrentCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDeleteCandidate = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) {
      try {
        await deleteCandidate(id);
        fetchCandidates();
      } catch (err) {
        setError('Gagal menghapus kandidat');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCandidate) return;

    try {
      if (currentCandidate.id) {
        await updateCandidate(currentCandidate.id, currentCandidate);
      } else {
        await createCandidate(currentCandidate as Omit<Candidate, 'id'>);
      }
      fetchCandidates();
      setIsModalOpen(false);
    } catch (err) {
      setError('Gagal menyimpan kandidat');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCandidate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Kandidat</h1>
      <button onClick={handleAddCandidate} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Tambah Kandidat</button>

      {candidates.length === 0 ? (
        <p>Tidak ada kandidat.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nama</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Posisi Dilamar</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{candidate.name}</td>
                  <td className="py-2 px-4 border-b">{candidate.email}</td>
                  <td className="py-2 px-4 border-b">{candidate.position_applied}</td>
                  <td className="py-2 px-4 border-b">{candidate.status}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => handleEditCandidate(candidate)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDeleteCandidate(candidate.id)} className="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
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
            <h2 className="text-xl font-bold mb-4">{currentCandidate?.id ? 'Edit Kandidat' : 'Tambah Kandidat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Nama</label>
                <input type="text" name="name" value={currentCandidate?.name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input type="email" name="email" value={currentCandidate?.email || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Telepon</label>
                <input type="text" name="phone" value={currentCandidate?.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Posisi Dilamar</label>
                <input type="text" name="position_applied" value={currentCandidate?.position_applied || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Status</label>
                <select name="status" value={currentCandidate?.status || 'Applied'} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">URL Resume</label>
                <input type="text" name="resume_url" value={currentCandidate?.resume_url || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
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

export default HalamanKandidat;
