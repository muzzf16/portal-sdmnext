import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Kinerja, PerformanceReviewKpi } from '../types';
import { buatPenilaianKinerja, CreateKinerjaPayload } from '../api/kinerjaApi';
import { getKpiTargets } from '../api/kpiApi';
import { getPegawai } from '../../01-pegawai/api/employeeApi';

type ReviewKpiRow = Omit<PerformanceReviewKpi, 'id'> & { id: string; fromKpiTarget: boolean };

const FormKinerja: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<Omit<Kinerja, 'id' | 'overallScore' | 'status' | 'createdAt'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [kpiRows, setKpiRows] = useState<ReviewKpiRow[]>([{ id: String(Date.now()), name: '', score: 0, weight: 0, targetValue: 0, actualValue: 0, targetUnit: '', fromKpiTarget: false }]);

  // Auto-fill reviewer name and penilaiId (NIP) from user session + employee API
  React.useEffect(() => {
    const fillReviewerInfo = async () => {
      if (!user) return;
      if (user.name) setValue('reviewerName', user.name);

      // Fetch NIP from employee data using user.employeeId
      if (user.employeeId) {
        try {
          const res = await getPegawai();
          const allEmployees = Array.isArray(res.data) ? res.data : [];
          const currentEmployee = allEmployees.find((e: any) => e.id === user.employeeId);
          if (currentEmployee?.nip) {
            setValue('penilaiId', currentEmployee.nip);
          }
        } catch {
          // fallback: use employeeId if fetch fails
          setValue('penilaiId', user.employeeId);
        }
      }
    };
    fillReviewerInfo();
  }, [user, setValue]);

  // Load employees for dropdown
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        let responseData: any = [];
        if (user?.role === 'supervisor' && user?.employeeId) {
          const res = await import('../../01-pegawai/api/jabatanApi').then(m => m.getSubordinates(String(user.employeeId), true));
          if (Array.isArray(res)) responseData = res;
        } else {
          const response = await getPegawai();
          if (response.data && Array.isArray(response.data)) {
            responseData = response.data;
          }
        }
        setEmployees(responseData);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, [user]);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmployeeId = e.target.value;
    const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

    if (selectedEmployee) {
      setValue('employeeId', selectedEmployeeId);
      setValue('employeeName', selectedEmployee.name);
    }
  };

  const selectedEmployeeId = watch('employeeId');
  const selectedPeriod = watch('period');

  // Auto-fill KPI rows if employee and period are selected
  React.useEffect(() => {
    const fetchKpis = async () => {
      if (selectedEmployeeId && selectedPeriod) {
        try {
          const res = await getKpiTargets({ employeeId: selectedEmployeeId, period: selectedPeriod });
          const targetKpis = res.data?.data || res.data;
          console.log('Fetched KPIs for auto-fill:', targetKpis);

          if (Array.isArray(targetKpis) && targetKpis.length > 0) {
            const mappedKpis: ReviewKpiRow[] = targetKpis.map(kpi => ({
              id: String(kpi.id || `${Date.now()}-${Math.random()}`),
              name: kpi.kpiName || '',
              score: kpi.score || 0,
              weight: kpi.weight || 0,
              targetValue: kpi.targetValue || 0,
              actualValue: kpi.actualValue || 0,
              targetUnit: kpi.targetUnit || '',
              fromKpiTarget: true  // Mark as auto-pulled (locked)
            }));
            setKpiRows(mappedKpis);
          } else {
            setKpiRows([{ id: String(Date.now()), name: '', score: 0, weight: 0, targetValue: 0, actualValue: 0, targetUnit: '', fromKpiTarget: false }]);
          }
        } catch (err) {
          console.error('Failed to auto-fetch KPIs:', err);
        }
      }
    };
    fetchKpis();
  }, [selectedEmployeeId, selectedPeriod]);

  // Function to prepare data for submission with KPIs
  const prepareSubmissionData = (
    formData: Omit<Kinerja, 'id' | 'overallScore' | 'status' | 'createdAt'>,
    status: CreateKinerjaPayload['status']
  ): CreateKinerjaPayload => {
    const reviewDate = formData.reviewDate || new Date().toISOString().split('T')[0];
    const defaultDeadline = new Date(reviewDate);
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);

    return {
      ...formData,
      kpis: kpiRows.map(({ fromKpiTarget, ...kpi }) => kpi),
      status,
      selfAssessmentDeadline: status === 'Awaiting SA' ? defaultDeadline.toISOString().split('T')[0] : undefined
    };
  };

  const onSubmit = async (data: Omit<Kinerja, 'id' | 'overallScore' | 'status' | 'createdAt'>) => {
    const submissionData = prepareSubmissionData(data, 'Awaiting SA');
    setIsSubmitting(true);
    try {
      await buatPenilaianKinerja(submissionData);
      alert('Penilaian kinerja berhasil dibuat dan dikirim ke pegawai untuk self-assessment.');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal membuat penilaian kinerja.');
      console.error('Error creating kinerja:', error);
    }
    setIsSubmitting(false);
  };

  // Function to save as draft
  const saveAsDraft = async (data: Omit<Kinerja, 'id' | 'overallScore' | 'status' | 'createdAt'>) => {
    const submissionData = prepareSubmissionData(data, 'Draft');
    setIsSubmitting(true);
    try {
      await buatPenilaianKinerja(submissionData);
      alert('Penilaian kinerja berhasil disimpan sebagai draft!');
      // Optionally, clear form or close modal
    } catch (error) {
      alert('Gagal menyimpan draft penilaian kinerja.');
      console.error('Error saving draft:', error);
    }
    setIsSubmitting(false);
  };

  // Function to add a new KPI row
  const addKpiRow = () => {
    setKpiRows([...kpiRows, { id: String(Date.now()), name: '', score: 0, weight: 0, targetValue: 0, actualValue: 0, targetUnit: '', fromKpiTarget: false }]);
  };

  // Function to remove a KPI row
  const removeKpiRow = (id: string) => {
    if (kpiRows.length > 1) {
      setKpiRows(kpiRows.filter(row => row.id !== id));
    }
  };

  // Function to update KPI row data
  const updateKpiRow = (id: string, field: keyof Omit<ReviewKpiRow, 'id' | 'fromKpiTarget'>, value: string | number) => {
    setKpiRows(kpiRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-primary-dark-blue mb-6 text-center">Buat Penilaian Kinerja Baru</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-slate-700 mb-1">Pilih Pegawai</label>
            <select
              id="employee"
              {...register('employeeId', {
                required: 'Pegawai wajib dipilih',
                onChange: handleEmployeeChange
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Pegawai</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.nip})
                </option>
              ))}
            </select>
            {errors.employeeId && <span className="text-red-500 text-sm">{errors.employeeId.message}</span>}
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-slate-700 mb-1">Periode Semester</label>
            <select
              id="period"
              {...register('period', { required: 'Periode wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="">Pilih Periode</option>
              {[...Array(3)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return [
                  <option key={`${year}-S1`} value={`${year}-S1`}>{year} - Semester 1</option>,
                  <option key={`${year}-S2`} value={`${year}-S2`}>{year} - Semester 2</option>,
                ];
              })}
            </select>
            {errors.period && <span className="text-red-500 text-sm">{errors.period.message}</span>}
          </div>
          <div>
            <label htmlFor="reviewType" className="block text-sm font-medium text-slate-700 mb-1">Jenis Review</label>
            <select
              id="reviewType"
              {...register('reviewType' as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            >
              <option value="end-period">Akhir Periode</option>
              <option value="mid-period">Tengah Periode (Mid-Review)</option>
            </select>
          </div>
          <div>
            <label htmlFor="reviewerName" className="block text-sm font-medium text-slate-700 mb-1">Nama Penilai</label>
            <input
              id="reviewerName"
              {...register('reviewerName', { required: 'Nama penilai wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.reviewerName && <span className="text-red-500 text-sm">{errors.reviewerName.message}</span>}
          </div>
          <div>
            <label htmlFor="reviewDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Penilaian</label>
            <input
              id="reviewDate"
              type="date"
              {...register('reviewDate', { required: 'Tanggal penilaian wajib diisi' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
            {errors.reviewDate && <span className="text-red-500 text-sm">{errors.reviewDate.message}</span>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="strengths" className="block text-sm font-medium text-slate-700 mb-1">Kekuatan</label>
            <textarea
              id="strengths"
              {...register('strengths')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="areasForImprovement" className="block text-sm font-medium text-slate-700 mb-1">Area Peningkatan</label>
            <textarea
              id="areasForImprovement"
              {...register('areasForImprovement')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="employeeFeedback" className="block text-sm font-medium text-slate-700 mb-1">Umpan Balik Karyawan</label>
            <textarea
              id="employeeFeedback"
              {...register('employeeFeedback')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            ></textarea>
          </div>

          {/* Dynamic KPI Table */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">KPIs (Key Performance Indicators)</label>
              <button
                type="button"
                onClick={addKpiRow}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
              >
                Tambah KPI
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama KPI</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realisasi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bobot (%)</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kpiRows.map((row) => (
                    <tr key={row.id} className={row.fromKpiTarget ? 'bg-blue-50/50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateKpiRow(row.id, 'name', e.target.value)}
                          readOnly={row.fromKpiTarget}
                          className={`w-full px-3 py-1 border rounded-md shadow-sm focus:outline-none ${row.fromKpiTarget ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' : 'border-gray-300 focus:ring-primary-dark-blue focus:border-primary-dark-blue'}`}
                          placeholder="Nama KPI"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {row.fromKpiTarget ? `${row.targetValue} ${row.targetUnit}` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {row.fromKpiTarget ? `${row.actualValue} ${row.targetUnit}` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.fromKpiTarget ? (
                          <span className={`font-semibold text-sm ${row.score >= 4 ? 'text-emerald-600' :
                            row.score >= 3 ? 'text-yellow-600' :
                              row.score >= 2 ? 'text-orange-600' : 'text-red-600'
                            }`}>{row.score}/5</span>
                        ) : (
                          <input
                            type="number" min="0" max="5" step="0.1"
                            value={row.score}
                            onChange={(e) => updateKpiRow(row.id, 'score', parseFloat(e.target.value) || 0)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
                            placeholder="0-5"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.fromKpiTarget ? (
                          <span className="text-sm text-gray-700 font-medium">{row.weight}%</span>
                        ) : (
                          <input
                            type="number" min="0" max="100"
                            value={row.weight}
                            onChange={(e) => updateKpiRow(row.id, 'weight', parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
                            placeholder="%"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.fromKpiTarget ? (
                          <span className="text-xs text-blue-500 font-medium">🔒 Dari KPI</span>
                        ) : (
                          kpiRows.length > 1 && (
                            <button type="button" onClick={() => removeKpiRow(row.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">Hapus</button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <label htmlFor="penilaiId" className="block text-sm font-medium text-slate-700 mb-1">ID Penilai</label>
            <input
              id="penilaiId"
              {...register('penilaiId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-blue focus:border-primary-dark-blue"
            />
          </div>
        </div>

        {/* Draft/Submit buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => {
              // Get form data from watch() or handleSubmit for draft
              const formData = getValues();
              saveAsDraft(formData);
            }}
            disabled={isSubmitting}
            className="w-1/2 px-4 py-2 font-bold text-white bg-yellow-500 rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
          >
            Simpan Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-1/2 px-4 py-2 font-bold text-white bg-primary-dark-blue rounded-md hover:bg-opacity-90 disabled:bg-slate-400 transition-colors duration-200"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormKinerja;
