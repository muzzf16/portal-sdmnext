import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKinerja } from '../hooks/useKinerja';
import { ArrowLeft } from 'lucide-react';

interface DetailKinerjaProps {
  performanceId: string | undefined;
}

const DetailKinerja: React.FC<DetailKinerjaProps> = ({ performanceId }) => {
  const navigate = useNavigate();

  if (!performanceId) {
    return (
      <div className="mt-8 p-8 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">Penilaian kinerja tidak ditemukan</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm">
          ← Kembali
        </button>
      </div>
    );
  }

  const { kinerja, loading, error } = useKinerja(performanceId);

  if (loading) return <div className="mt-8 text-center py-12 text-gray-500">Memuat penilaian...</div>;
  if (error) return <div className="mt-8 text-center py-12 text-red-500">Error: {error.message}</div>;
  if (!kinerja) return <div className="mt-8 text-center py-12 text-gray-500">Penilaian kinerja tidak ditemukan</div>;

  const kpis = Array.isArray(kinerja.kpis) ? kinerja.kpis : [];

  return (
    <div className="mt-8 space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Kembali ke Daftar Penilaian
      </button>

      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary-dark-blue">{kinerja.employeeName}</h2>
            <p className="text-gray-500 text-sm mt-1">Periode: {kinerja.period}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${kinerja.status === 'Completed' ? 'bg-green-100 text-green-800' :
            kinerja.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {kinerja.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">Penilai</p>
            <p className="font-semibold text-gray-800">{kinerja.reviewerName || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tanggal Penilaian</p>
            <p className="font-semibold text-gray-800">{kinerja.reviewDate || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Skor Keseluruhan</p>
            <p className="text-3xl font-bold text-primary-dark-blue">{kinerja.overallScore?.toFixed(2) || '-'}<span className="text-lg text-gray-400"> / 5</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Penilai</p>
            <p className="font-semibold text-gray-800 text-xs">{kinerja.penilaiId || '-'}</p>
          </div>
        </div>

        {/* KPI Table */}
        {kpis.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Rincian KPI</h3>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nama KPI</th>
                  <th className="px-4 py-3 text-center">Target</th>
                  <th className="px-4 py-3 text-center">Realisasi</th>
                  <th className="px-4 py-3 text-center">Skor</th>
                  <th className="px-4 py-3 text-center">Bobot (%)</th>
                  <th className="px-4 py-3 text-center">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.map((kpi: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{kpi.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {kpi.targetValue ? `${kpi.targetValue} ${kpi.targetUnit || ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {kpi.actualValue !== undefined ? `${kpi.actualValue} ${kpi.targetUnit || ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${kpi.score >= 4 ? 'text-emerald-600' :
                          kpi.score >= 3 ? 'text-yellow-600' :
                            kpi.score >= 2 ? 'text-orange-600' : 'text-red-600'
                        }`}>{kpi.score}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{kpi.weight}%</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {((kpi.score * kpi.weight) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes sections */}
        {kinerja.strengths && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Kekuatan</p>
            <p className="text-gray-800 bg-green-50 p-3 rounded-md text-sm">{kinerja.strengths}</p>
          </div>
        )}
        {kinerja.areasForImprovement && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Area Peningkatan</p>
            <p className="text-gray-800 bg-yellow-50 p-3 rounded-md text-sm">{kinerja.areasForImprovement}</p>
          </div>
        )}
        {kinerja.employeeFeedback && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Umpan Balik Karyawan</p>
            <p className="text-gray-800 bg-blue-50 p-3 rounded-md text-sm">{kinerja.employeeFeedback}</p>
          </div>
        )}

        {kinerja.createdAt && (
          <p className="text-xs text-gray-400 border-t pt-4">
            Dibuat pada: {new Date(kinerja.createdAt).toLocaleString('id-ID')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DetailKinerja;
