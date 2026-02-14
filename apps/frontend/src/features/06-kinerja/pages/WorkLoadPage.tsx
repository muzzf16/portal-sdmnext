
import React, { useState, useEffect } from 'react';
import WorkLoadForm from '../components/WorkLoadForm';
import { getWorkloadAnalysis } from '../api/workloadApi';

interface WorkLoadPageProps {
    employeeId?: string;
}

const WorkLoadPage: React.FC<WorkLoadPageProps> = ({ employeeId }) => {
    const user = { id: 'dummy-id', name: 'Dummy User' }; // Replace with actual auth
    const [year, setYear] = useState(new Date().getFullYear());
    const [fteData, setFteData] = useState<{
        ftePercentage?: number;
        fteStatus?: 'Overload' | 'Normal' | 'Underload';
        hoursPerDay?: number;
        totalYearlyMinutes?: number;
    } | null>(null);

    const targetEmployeeId = employeeId || user?.id;

    // Fetch FTE data
    useEffect(() => {
        const fetchFte = async () => {
            if (!targetEmployeeId) return;
            try {
                const res = await getWorkloadAnalysis(targetEmployeeId, year);
                if (res.data?.data) {
                    setFteData({
                        ftePercentage: res.data.data.ftePercentage,
                        fteStatus: res.data.data.fteStatus,
                        hoursPerDay: res.data.data.hoursPerDay,
                        totalYearlyMinutes: res.data.data.totalYearlyMinutes,
                    });
                } else {
                    setFteData(null);
                }
            } catch (err) {
                setFteData(null);
            }
        };
        fetchFte();
    }, [targetEmployeeId, year]);

    const getFteStatusColor = (status?: string) => {
        switch (status) {
            case 'Overload': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🔴' };
            case 'Normal': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🟢' };
            case 'Underload': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🟡' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '⚪' };
        }
    };

    const fteColors = getFteStatusColor(fteData?.fteStatus);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analisis Beban Kerja (Laporan Kerja)</h1>
                <p className="text-gray-600">Formulir analisis beban kerja tahunan pegawai.</p>
            </div>

            {/* FTE Dashboard Card */}
            {fteData && fteData.ftePercentage !== undefined && (
                <div className={`mb-6 rounded-lg p-5 border ${fteColors.bg} ${fteColors.border}`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">{fteColors.icon}</div>
                            <div>
                                <h3 className={`text-lg font-bold ${fteColors.text}`}>
                                    Status Beban Kerja: {fteData.fteStatus}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Berdasarkan perhitungan FTE (Full Time Equivalent)
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className={`text-3xl font-bold ${fteColors.text}`}>{fteData.ftePercentage}%</p>
                                <p className="text-xs text-gray-500">FTE</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-800">{fteData.hoursPerDay}</p>
                                <p className="text-xs text-gray-500">Jam/Hari</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-800">
                                    {fteData.totalYearlyMinutes ? Math.round(fteData.totalYearlyMinutes / 60) : 0}
                                </p>
                                <p className="text-xs text-gray-500">Total Jam/Tahun</p>
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${fteData.fteStatus === 'Overload' ? 'bg-red-500' :
                                        fteData.fteStatus === 'Normal' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                style={{ width: `${Math.min(fteData.ftePercentage || 0, 150)}%`, maxWidth: '100%' }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span className="text-yellow-600">80% (Underload)</span>
                            <span className="text-green-600">100% (Normal)</span>
                            <span className="text-red-600">&gt;100% (Overload)</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center space-x-4">
                <label className="font-medium text-gray-700">Tahun:</label>
                <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="rounded-md border-gray-300 shadow-sm border p-2"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
            </div>

            {targetEmployeeId ? (
                <WorkLoadForm
                    employeeId={targetEmployeeId}
                    year={year}
                    onSaved={() => {
                        // Refresh FTE after saving
                        setTimeout(async () => {
                            try {
                                const res = await getWorkloadAnalysis(targetEmployeeId, year);
                                if (res.data?.data) {
                                    setFteData({
                                        ftePercentage: res.data.data.ftePercentage,
                                        fteStatus: res.data.data.fteStatus,
                                        hoursPerDay: res.data.data.hoursPerDay,
                                        totalYearlyMinutes: res.data.data.totalYearlyMinutes,
                                    });
                                }
                            } catch { }
                        }, 500);
                    }}
                />
            ) : (
                <div>Loading user data...</div>
            )}
        </div>
    );
};

export default WorkLoadPage;
