import React from 'react';
import { usePelatihan } from '../hooks/usePelatihan';
import { Card } from '@/shared/components/ui/Card';
import { FileText, Calendar, User, Award, Edit2, Trash2 } from 'lucide-react';
import { Pelatihan } from '@/shared/types/types';

interface DaftarPelatihanProps {
  onEdit?: (item: Pelatihan) => void;
  onDelete?: (id: number) => void;
}

const DaftarPelatihan: React.FC<DaftarPelatihanProps> = ({ onEdit, onDelete }) => {
  const { pelatihan, loading, error } = usePelatihan();

  if (loading) {
    return (
      <Card className="p-6 text-center text-neutral-500">
        Memuat data pelatihan...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500">
        Error: {error.message}
      </Card>
    );
  }

  const showActions = Boolean(onEdit || onDelete);

  return (
    <Card className="overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-neutral-200 bg-white flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Daftar Seluruh Pelatihan
        </h2>
        <span className="text-xs text-neutral-500 font-medium">
          Total: {pelatihan.length} Pelatihan
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Nama Pelatihan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Peserta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Penyelenggara
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Tanggal Mulai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Tanggal Selesai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Surat Penawaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                SPPD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Sertifikat
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {pelatihan.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 9 : 8} className="px-6 py-8 text-center text-sm text-neutral-500">
                  Belum ada data pelatihan yang dicatat.
                </td>
              </tr>
            ) : (
              pelatihan.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      {item.nama_pelatihan}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                      <User className="w-4 h-4 text-neutral-400 shrink-0" />
                      {item.nama_peserta || item.employee_name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {item.penyelenggara}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      {item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      {item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.surat_penawaran ? (
                      <a
                        href={`/documents/${item.surat_penawaran.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-medium text-xs border border-amber-200 transition"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Lihat Surat Penawaran
                      </a>
                    ) : (
                      <span className="text-neutral-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.surat_jalan || item.sppd ? (
                      <a
                        href={`/documents/${(item.surat_jalan || item.sppd || '').split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-xs border border-indigo-200 transition"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Lihat SPPD
                      </a>
                    ) : (
                      <span className="text-neutral-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.nomor_sertifikat ? (
                      <a
                        href={`/documents/${item.nomor_sertifikat.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-xs shadow-sm transition"
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        Lihat Sertifikat
                      </a>
                    ) : (
                      <span className="text-neutral-400 text-xs">-</span>
                    )}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center p-1 rounded hover:bg-indigo-50 transition"
                          title="Edit Pelatihan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-50 transition"
                          title="Hapus Pelatihan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DaftarPelatihan;
