
import React, { useState, useEffect } from 'react';
import { backupAPI, BackupFile } from '../../../shared/services';
import { Database, Download, RefreshCw, Clock, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const HalamanBackup: React.FC = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await backupAPI.list();
      if (response.success) {
        setBackups(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching backups:', error);
      setMessage({ type: 'error', text: 'Gagal memuat daftar backup.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const response = await backupAPI.create();
      if (response.success) {
        setMessage({ type: 'success', text: 'Backup database berhasil dibuat.' });
        fetchBackups();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal membuat backup.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (!window.confirm(`PERINGATAN: Anda akan memulihkan database dari file ${filename}. Data saat ini akan ditimpa. Lanjutkan?`)) {
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const response = await backupAPI.restore(filename);
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Restorasi database berhasil.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memulihkan database.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-neutral-900 transition-colors duration-300">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Backup & Restore
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1">
            Kelola salinan cadangan database untuk menjaga integritas data sistem.
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={actionLoading}
          className={clsx(
            "flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all shadow-lg",
            actionLoading 
              ? "bg-slate-300 cursor-not-allowed text-slate-500" 
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95"
          )}
        >
          {actionLoading ? (
            <RefreshCw size={20} className="mr-2 animate-spin" />
          ) : (
            <Database size={20} className="mr-2" />
          )}
          BUAT BACKUP SEKARANG
        </button>
      </header>

      {message && (
        <div className={clsx(
          "mb-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics / Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <HardDrive size={20} className="mr-2 text-indigo-500" /> Informasi Sistem
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-neutral-700">
                <span className="text-slate-500 text-sm">Total Backup</span>
                <span className="font-bold text-slate-800 dark:text-white">{backups.length} File</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-neutral-700">
                <span className="text-slate-500 text-sm">Backup Terakhir</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {backups.length > 0 ? format(new Date(backups[0].createdAt), 'dd MMM yyyy') : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm">Penyimpanan</span>
                <span className="font-bold text-slate-800 dark:text-white">Lokal (Server)</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <AlertCircle size={14} className="inline mr-1 mb-0.5" />
                <strong>Saran Keamanan:</strong> Selalu unduh file backup penting ke penyimpanan offline Anda secara berkala.
              </p>
            </div>
          </div>
        </div>

        {/* Backup Table */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-neutral-700/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File Backup</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ukuran</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu Pembuatan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Memuat...</td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Belum ada file backup.</td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.filename} className="hover:bg-slate-50 dark:hover:bg-neutral-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-3 text-indigo-600 dark:text-indigo-400">
                              <Database size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{b.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400">
                          {formatSize(b.size)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-500 dark:text-neutral-400">
                            <Clock size={14} className="mr-1.5" />
                            {format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRestore(b.filename)}
                              disabled={actionLoading}
                              title="Restore Database"
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                            >
                              <RefreshCw size={18} className={clsx(actionLoading && "animate-spin")} />
                            </button>
                            <button
                              title="Download Backup"
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanBackup;
