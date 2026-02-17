
import React, { useState, useEffect } from 'react';
import WorkLoadForm from '../components/WorkLoadForm';
import { getWorkloadAnalysis } from '../api/workloadApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import { getPegawai } from '../../01-pegawai/api/employeeApi';
import { Pegawai } from '../../01-pegawai/types';

interface WorkLoadPageProps {
    employeeId?: string;
}

const WorkLoadPage: React.FC<WorkLoadPageProps> = ({ employeeId }) => {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [fteData, setFteData] = useState<{
        ftePercentage?: number;
        fteStatus?: 'Overload' | 'Normal' | 'Underload';
        hoursPerDay?: number;
        totalYearlyMinutes?: number;
    } | null>(null);

    // State for admin selection
    const [employees, setEmployees] = useState<Pegawai[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    // Determine target employee ID: prop > selected (admin) > user's linked employee
    const targetEmployeeId = employeeId || selectedEmployeeId || user?.employeeId || '';


    // Fetch employees for admin
    useEffect(() => {
        if (isAdmin && !employeeId) {
            setIsLoadingEmployees(true);
            getPegawai()
                .then(res => {
                    const data = Array.isArray(res) ? res : (res.data || []);
                    setEmployees(data);
                })
                .catch(err => console.error("Failed to fetch employees", err))
                .finally(() => setIsLoadingEmployees(false));
        }
    }, [isAdmin, employeeId]);


    // Fetch FTE data
    const fetchFte = async () => {
        if (!targetEmployeeId) {
            setFteData(null);
            return;
        }
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

    useEffect(() => {
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

            {/* Admin Employee Selector */}
            {isAdmin && !employeeId && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                        Admin Mode: Pilih Pegawai untuk Mengelola ABK
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            disabled={isLoadingEmployees}
                        >
                            <option value="">-- Pilih Pegawai --</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.nip}) - {emp.position}
                                </option>
                            ))}
                        </select>
                        {isLoadingEmployees && <span className="text-sm text-gray-500 self-center">Loading...</span>}
                    </div>
                </div>
            )}

            {/* Show error if no employee ID and NOT admin (or admin hasn't selected anyone yet) */}
            {!targetEmployeeId && !isAdmin && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: Profile tidak lengkap! </strong>
                    <span className="block sm:inline">
                        Akun Anda tidak terhubung dengan data pegawai. Silakan hubungi Admin untuk memperbaiki data "Employee ID" pada akun Anda.
                    </span>
                    <div className="mt-2 text-xs font-mono">
                        Global ID: {user?.id} | Email: {user?.email} | Role: {user?.role}
                    </div>
                </div>
            )}

            {/* Hint for Admin if no employee selected */}
            {!targetEmployeeId && isAdmin && (
                <div className="mb-6 bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded relative">
                    <span className="block sm:inline">
                        Silakan pilih pegawai terlebih dahulu untuk melihat atau membuat Analisis Beban Kerja.
                    </span>
                </div>
            )}


            {/* FTE Dashboard Card */}
            {fteData && targetEmployeeId && fteData.ftePercentage !== undefined && (
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <WorkLoadForm
                        employeeId={targetEmployeeId}
                        year={year}
                        onSaved={() => {
                            // Refresh FTE after saving
                            setTimeout(() => {
                                fetchFte();
                            }, 500);
                        }}
                    />
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-500">
                    <p>
                        {isAdmin
                            ? "Silakan pilih pegawai di atas untuk memulai."
                            : "Formulir tidak tersedia karena data profil pegawai tidak ditemukan."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default WorkLoadPage;
