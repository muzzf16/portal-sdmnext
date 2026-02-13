
import React, { useState } from 'react';
import WorkLoadForm from '../components/WorkLoadForm';
// import { useAuth } from '@/app/providers/AuthProvider'; // Assuming this exists

const WorkLoadPage: React.FC = () => {
    // const { user } = useAuth();
    const user = { id: 'dummy-id', name: 'Dummy User' }; // Replace with actual auth
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analisis Beban Kerja (Laporan Kerja)</h1>
                <p className="text-gray-600">Formulir analisis beban kerja tahunan pegawai.</p>
            </div>

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

            {user ? (
                <WorkLoadForm
                    employeeId={user.id}
                    year={year}
                />
            ) : (
                <div>Loading user data...</div>
            )}
        </div>
    );
};

export default WorkLoadPage;
