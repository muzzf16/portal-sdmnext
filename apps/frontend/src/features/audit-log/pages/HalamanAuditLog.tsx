import React, { useState, useEffect } from 'react';
import { auditLogAPI, AuditLog, AuditLogFilters, penggunaService } from '../../../shared/services';
import { Search, Calendar, User, Monitor, Hash, Info, List } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const HalamanAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
    startDate: '',
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogAPI.getAll(filters);
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await penggunaService.getAllPengguna();
      // Check if response.data is an array (direct response)
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Check if response.data.data is an array (wrapped response)
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: AuditLogFilters) => ({ ...prev, [name]: value }));
  };

  const formatLocalTime = (utcString: string) => {
    if (!utcString) return '-';
    // SQLite CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" (UTC)
    // We add 'Z' to make it ISO UTC so new Date() converts it to local
    const isoString = utcString.replace(' ', 'T') + 'Z';
    try {
      return format(new Date(isoString), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return utcString;
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-neutral-900 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight font-serif">
          Daftar Akses Pemakai
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 mt-1">
          Monitor riwayat aktivitas dan akses sistem oleh pengguna secara real-time.
        </p>
      </header>

      {/* Filter Section */}
      <section className="mb-8">
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 dark:border-neutral-700/30 transition-all">
          <form onSubmit={handleApplyFilter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <User size={16} className="mr-2 text-indigo-500" /> Pengguna
              </label>
              <select
                name="userId"
                value={filters.userId || ''}
                onChange={handleFilterChange}
                className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                <option value="">Semua User</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name || u.username}</option>
                ))}
              </select>
            </div>

            {/* Activity Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <List size={16} className="mr-2 text-indigo-500" /> Aktifitas
              </label>
              <select
                name="action"
                value={filters.action || ''}
                onChange={handleFilterChange}
                className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                <option value="">Semua</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="READ">READ</option>
              </select>
            </div>

            {/* Period Filter */}
            <div className="space-y-2 lg:col-span-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <Calendar size={16} className="mr-2 text-indigo-500" /> Periode
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate || ''}
                  onChange={handleFilterChange}
                  className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <span className="text-slate-400">s/d</span>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate || ''}
                  onChange={handleFilterChange}
                  className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Search / Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <Info size={16} className="mr-2 text-indigo-500" /> Keterangan
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search || ''}
                  onChange={handleFilterChange}
                  placeholder="Cari keterangan..."
                  className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

             {/* Device Filter */}
             <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <Monitor size={16} className="mr-2 text-indigo-500" /> Device
              </label>
              <select
                name="device"
                value={filters.device || ''}
                onChange={handleFilterChange}
                className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                <option value="">Semua Device</option>
                <option value="Web/Desktop">Web/Desktop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>

            {/* Limit Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-neutral-300">
                <Hash size={16} className="mr-2 text-indigo-500" /> Limit
              </label>
              <input
                type="number"
                name="limit"
                value={filters.limit || ''}
                onChange={handleFilterChange}
                className="w-full bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="flex items-end lg:col-span-1">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                TAMPILKAN
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-neutral-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-neutral-700/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider text-center">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Aksi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Modul</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 dark:text-neutral-400 font-medium">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-neutral-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                logs.map((log: AuditLog, index: number) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50 dark:hover:bg-neutral-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300 text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-neutral-400">
                      {formatLocalTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                      {users.find(u => u.id === log.user_id)?.name || log.user_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300">
                      <div className="flex items-center">
                        <Monitor size={14} className="mr-1.5 text-slate-400" />
                        {log.device || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        log.action === 'LOGIN' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        log.action === 'LOGOUT' ? "bg-slate-100 text-slate-700 dark:bg-neutral-700 dark:text-neutral-400" :
                        log.action === 'DELETE' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        log.action === 'UPDATE' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-neutral-300">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-neutral-400 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HalamanAuditLog;
