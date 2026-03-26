import React, { useState } from 'react';
import { useUploadMachineLogMutation } from '../hooks/useAttendanceQuery';

interface LogMachineUploadProps {
    onUploadComplete?: () => void;
}

const LogMachineUpload: React.FC<LogMachineUploadProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const uploadMutation = useUploadMachineLogMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Silakan pilih file log (.txt) terlebih dahulu');
            return;
        }
        setLoading(true);
        try {
            const data = await uploadMutation.mutateAsync(file);
            setLoading(false);
            setError(null);
            setSuccess(`Berhasil mengunggah log. Dibuat: ${data.created || 0}, Diperbarui: ${data.updated || 0}`);
            setFile(null);
            setTimeout(() => setSuccess(null), 5000);

            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Gagal mengunggah file log mesin');
            setLoading(false);
            setSuccess(null);
        }
    };

    return (
        <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Unggah Log Mesin Absensi (TXT)</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 w-full">
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                </div>
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className={`px-4 py-2 rounded-md text-white font-medium ${loading || !file
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {loading ? 'Mengunggah...' : 'Unggah File'}
                </button>
            </div>

            {error && (
                <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-3 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                    {success}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Catatan:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pilih file berformat <code className="bg-gray-100 px-1 rounded">.txt</code> yang ditarik dari mesin absensi.</li>
                    <li>Sistem akan mencocokkan ID Mesin (EnNo) atau Nama dengan data Pegawai.</li>
                    <li>Jika ada dua log (masuk & keluar) pada tanggal yang sama, sistem akan menghitung durasi jam kerja secara otomatis.</li>
                </ul>
            </div>
        </div>
    );
};

export default LogMachineUpload;
