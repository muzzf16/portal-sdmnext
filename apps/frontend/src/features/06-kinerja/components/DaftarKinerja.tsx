import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDaftarKinerja } from '../hooks/useDaftarKinerja';
import { transitionStatus } from '../api/kinerjaApi';
import { Table, Badge } from '@/shared/components/ui';
import { Kinerja, ReviewStatus } from '../types';

// Status → Badge variant/color mapping
const STATUS_CONFIG: Record<string, { variant: 'success' | 'secondary' | 'warning' | 'info' | 'danger'; label: string }> = {
  'Draft': { variant: 'secondary', label: 'Draft' },
  'Awaiting SA': { variant: 'info', label: 'Menunggu Self-Assessment' },
  'SA Submitted': { variant: 'warning', label: 'SA Terkirim' },
  'In Review': { variant: 'warning', label: 'Sedang Direview' },
  'Completed': { variant: 'success', label: 'Selesai' },
  'Finalized': { variant: 'success', label: '✅ Final' },
};

// Next valid transition per status (for quick-action buttons)
const NEXT_ACTIONS: Record<string, { target: ReviewStatus; label: string; needsDeadline?: boolean }[]> = {
  'Draft': [{ target: 'Awaiting SA', label: 'Kirim ke Pegawai', needsDeadline: true }],
  'SA Submitted': [{ target: 'In Review', label: 'Mulai Review' }],
  'In Review': [{ target: 'Completed', label: 'Selesai Review' }],
  'Completed': [{ target: 'Finalized', label: 'Finalisasi' }],
};

const DaftarKinerja: React.FC = () => {
  const { daftarKinerja, loading, error, refetch } = useDaftarKinerja();
  const [deadlineModal, setDeadlineModal] = useState<{ id: string; target: ReviewStatus } | null>(null);
  const [deadline, setDeadline] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleTransition = async (id: string, targetStatus: ReviewStatus, saDeadline?: string) => {
    if (!confirm(`Ubah status ke "${targetStatus}"?`)) return;
    setActionLoading(id);
    try {
      await transitionStatus(id, targetStatus, saDeadline);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setActionLoading(null);
      setDeadlineModal(null);
    }
  };

  if (loading) return <div className="text-center py-4">Memuat...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;

  const tableHeaders = ['Nama Pegawai', 'Periode', 'Skor', 'Status', 'Deadline SA', 'Aksi'];

  return (
    <div className="mt-6">
      <Table headers={tableHeaders}>
        {daftarKinerja.map((kinerja: Kinerja) => {
          const statusCfg = STATUS_CONFIG[kinerja.status] || { variant: 'secondary' as const, label: kinerja.status };
          const actions = NEXT_ACTIONS[kinerja.status] || [];

          return (
            <tr key={kinerja.id}>
              <td className="py-4 px-6">{kinerja.employeeName}</td>
              <td className="py-4 px-6">{kinerja.period}</td>
              <td className="py-4 px-6 font-semibold">{kinerja.overallScore || '-'}</td>
              <td className="py-4 px-6">
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              </td>
              <td className="py-4 px-6 text-sm text-gray-500">
                {kinerja.selfAssessmentDeadline
                  ? new Date(kinerja.selfAssessmentDeadline).toLocaleDateString('id-ID')
                  : '-'}
              </td>
              <td className="py-4 px-6">
                <div className="flex gap-2 items-center flex-wrap">
                  <Link
                    to={`/dashboard/kinerja/${kinerja.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Detail
                  </Link>
                  {actions.map(action => (
                    <button
                      key={action.target}
                      disabled={actionLoading === kinerja.id}
                      onClick={() => {
                        if (action.needsDeadline) {
                          setDeadlineModal({ id: kinerja.id, target: action.target });
                          setDeadline(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
                        } else {
                          handleTransition(kinerja.id, action.target);
                        }
                      }}
                      className="text-xs px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium disabled:opacity-50"
                    >
                      {actionLoading === kinerja.id ? '...' : action.label}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </Table>

      {/* Deadline Modal */}
      {deadlineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Set Deadline Self-Assessment</h3>
            <p className="text-sm text-gray-500 mb-4">Tentukan batas waktu pegawai mengisi self-assessment.</p>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeadlineModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Batal</button>
              <button
                onClick={() => handleTransition(deadlineModal.id, deadlineModal.target, deadline)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarKinerja;
