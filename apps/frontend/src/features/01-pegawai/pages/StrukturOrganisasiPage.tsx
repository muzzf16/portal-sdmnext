import React, { useState, useEffect } from 'react';
import { getJabatanTreeWithEmployees, getJabatanList, createJabatan, updateJabatan, deleteJabatan, JabatanTree, Jabatan } from '../api/jabatanApi';
import { ChevronDown, ChevronRight, Users, Plus, Edit3, Trash2, X, Building2, User } from 'lucide-react';
import clsx from 'clsx';

// ====== TREE NODE COMPONENT ======
const OrgNode: React.FC<{ node: JabatanTree; depth: number }> = ({ node, depth }) => {
    const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand top 2 levels

    const levelColors: Record<number, string> = {
        1: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
        2: 'border-green-500 bg-green-50 dark:bg-green-900/30',
        3: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30',
        4: 'border-gray-400 bg-gray-50 dark:bg-gray-800/50',
    };

    const levelLabels: Record<number, string> = {
        1: 'Direksi',
        2: 'Kepala Bidang',
        3: 'Kepala Sub Bidang',
        4: 'Staf',
    };

    const hasChildren = node.children && node.children.length > 0;
    const hasEmployees = node.employees && node.employees.length > 0;

    return (
        <div className={clsx('ml-0', depth > 0 && 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4')}>
            <div className={clsx(
                'border-l-4 rounded-lg p-3 mb-2 shadow-sm transition-all',
                levelColors[node.level] || levelColors[4]
            )}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {(hasChildren || hasEmployees) ? (
                            <button onClick={() => setIsOpen(!isOpen)} className="p-0.5 hover:bg-black/10 rounded">
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span className="w-5" />
                        )}
                        <Building2 size={18} className="text-gray-600 dark:text-gray-300" />
                        <div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{node.nama}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {levelLabels[node.level] || `Level ${node.level}`}
                                {node.department && ` • ${node.department}`}
                            </p>
                        </div>
                    </div>
                    {hasEmployees && (
                        <span className="text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 shadow-sm">
                            <Users size={12} className="inline mr-1" />
                            {node.employees!.length}
                        </span>
                    )}
                </div>

                {/* Employees */}
                {isOpen && hasEmployees && (
                    <div className="mt-2 space-y-1 pl-7">
                        {node.employees!.map((emp) => (
                            <div key={emp.id} className="flex items-center gap-2 text-sm py-1 px-2 bg-white/60 dark:bg-gray-700/50 rounded">
                                {emp.avatarUrl ? (
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                        <User size={12} />
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{emp.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({emp.nip})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Children */}
            {isOpen && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <OrgNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ====== FORM MODAL ======
const JabatanFormModal: React.FC<{
    jabatan?: Jabatan | null;
    allJabatan: Jabatan[];
    onClose: () => void;
    onSaved: () => void;
}> = ({ jabatan, allJabatan, onClose, onSaved }) => {
    const [nama, setNama] = useState(jabatan?.nama || '');
    const [level, setLevel] = useState(jabatan?.level || 4);
    const [parentId, setParentId] = useState<number | ''>(jabatan?.parent_id || '');
    const [department, setDepartment] = useState(jabatan?.department || '');
    const [deskripsi, setDeskripsi] = useState(jabatan?.deskripsi || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = {
                nama: nama.trim(),
                level,
                parent_id: parentId || null,
                department: department.trim() || null,
                deskripsi: deskripsi.trim() || null,
            };
            if (jabatan) {
                await updateJabatan(jabatan.id, data);
            } else {
                await createJabatan(data);
            }
            onSaved();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Gagal menyimpan');
        } finally {
            setLoading(false);
        }
    };

    // Filter parent options: exclude self and items at same/lower level
    const parentOptions = allJabatan.filter(j =>
        (!jabatan || j.id !== jabatan.id) && j.level < level
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {jabatan ? 'Edit Jabatan' : 'Tambah Jabatan'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nama Jabatan *</label>
                        <input
                            value={nama}
                            onChange={e => setNama(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                            placeholder="e.g. KABID Operasional"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Level *</label>
                            <select
                                value={level}
                                onChange={e => setLevel(Number(e.target.value))}
                                className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                            >
                                <option value={1}>1 - Direksi</option>
                                <option value={2}>2 - Kepala Bidang / PE</option>
                                <option value={3}>3 - Kepala Sub Bidang</option>
                                <option value={4}>4 - Staf</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Jabatan Induk</label>
                            <select
                                value={parentId}
                                onChange={e => setParentId(e.target.value ? Number(e.target.value) : '')}
                                className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                            >
                                <option value="">-- Tidak Ada --</option>
                                {parentOptions.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {'  '.repeat(p.level - 1)}{p.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Departemen</label>
                        <input
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                            placeholder="e.g. Operasional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Deskripsi</label>
                        <textarea
                            value={deskripsi}
                            onChange={e => setDeskripsi(e.target.value)}
                            className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-white"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-primary-700 text-white rounded hover:bg-primary-800 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ====== MAIN PAGE ======
const StrukturOrganisasiPage: React.FC = () => {
    const [tree, setTree] = useState<JabatanTree[]>([]);
    const [flatList, setFlatList] = useState<Jabatan[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
    const [showForm, setShowForm] = useState(false);
    const [editJabatan, setEditJabatan] = useState<Jabatan | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [treeData, listData] = await Promise.all([
                getJabatanTreeWithEmployees(),
                getJabatanList(),
            ]);
            setTree(treeData);
            setFlatList(listData);
        } catch (err) {
            console.error('Error fetching jabatan:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus jabatan ini?')) return;
        try {
            await deleteJabatan(id);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus');
        }
    };

    const levelLabels: Record<number, string> = {
        1: 'Direksi',
        2: 'Kepala Bidang',
        3: 'Kepala Sub Bidang',
        4: 'Staf',
    };

    return (
        <div className="dark:text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-800 dark:text-primary-200 font-serif">
                        Struktur Organisasi
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hierarki jabatan dan penempatan pegawai</p>
                </div>
                <div className="flex gap-2">
                    {/* View toggle */}
                    <div className="bg-gray-100 dark:bg-neutral-700 rounded-lg p-0.5 flex">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={clsx(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                viewMode === 'tree' ? 'bg-white dark:bg-neutral-600 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-400'
                            )}
                        >
                            🌳 Pohon
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={clsx(
                                'px-3 py-1.5 text-sm rounded-md transition-colors',
                                viewMode === 'table' ? 'bg-white dark:bg-neutral-600 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-400'
                            )}
                        >
                            📋 Tabel
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditJabatan(null); setShowForm(true); }}
                        className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <Plus size={16} /> Tambah Jabatan
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map(lvl => {
                    const count = flatList.filter(j => j.level === lvl).length;
                    return (
                        <div key={lvl} className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border dark:border-neutral-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">{levelLabels[lvl]}</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                            <div className="text-xs text-gray-400">jabatan</div>
                        </div>
                    );
                })}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Memuat data...</div>
            ) : viewMode === 'tree' ? (
                /* ===== TREE VIEW ===== */
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border dark:border-neutral-700">
                    {tree.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Belum ada data jabatan</div>
                    ) : (
                        tree.map(node => <OrgNode key={node.id} node={node} depth={0} />)
                    )}
                </div>
            ) : (
                /* ===== TABLE VIEW ===== */
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border dark:border-neutral-700 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b dark:border-neutral-700 text-left">
                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Jabatan</th>
                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Level</th>
                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Induk</th>
                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Departemen</th>
                                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flatList.map(j => (
                                <tr key={j.id} className="border-b dark:border-neutral-700/50 hover:bg-gray-50 dark:hover:bg-neutral-700/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span style={{ paddingLeft: `${(j.level - 1) * 16}px` }}>{j.nama}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx(
                                            'text-xs px-2 py-0.5 rounded-full',
                                            j.level === 1 && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                                            j.level === 2 && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                                            j.level === 3 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                            j.level === 4 && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                                        )}>
                                            {levelLabels[j.level] || `Level ${j.level}`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{j.parent_nama || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{j.department || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setEditJabatan(j); setShowForm(true); }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                title="Edit"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(j.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <JabatanFormModal
                    jabatan={editJabatan}
                    allJabatan={flatList}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); fetchData(); }}
                />
            )}
        </div>
    );
};

export default StrukturOrganisasiPage;
