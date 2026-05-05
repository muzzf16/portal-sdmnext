import React, { useState } from 'react';
import { useUploadMachineLogMutation } from '../hooks/useAttendanceQuery';

interface LogMachineUploadProps {
    onUploadComplete?: () => void;
}

interface SkippedEntry {
    machineEmployeeCode: string;
    employeeName: string;
    date: string;
}

const LogMachineUpload: React.FC<LogMachineUploadProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [skippedEntries, setSkippedEntries] = useState<SkippedEntry[]>([]);
    const uploadMutation = useUploadMachineLogMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setSuccess(null);
            setSkippedEntries([]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Silakan pilih file log (.txt) terlebih dahulu');
            return;
        }
        setLoading(true);
        setSkippedEntries([]);
        try {
            const data = await uploadMutation.mutateAsync(file);
            setLoading(false);
            setError(null);

            const parts = [`Dibuat: ${data.created || 0}`, `Diperbarui: ${data.updated || 0}`];
            if (data.skipped) {
                parts.push(`Dilewati: ${data.skipped}`);
            }
            setSuccess(`Berhasil mengunggah log. ${parts.join(', ')}`);

            if (data.skippedEntries?.length > 0) {
                setSkippedEntries(data.skippedEntries);
            }

            setFile(null);

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

            {skippedEntries.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                    <p className="font-medium text-yellow-800 mb-2">
                        ⚠️ {skippedEntries.length} data log tidak dapat dicocokkan dengan pegawai:
                    </p>
                    <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-yellow-700">
                                    <th className="py-1 pr-2">Kode Mesin</th>
                                    <th className="py-1 pr-2">Nama di Mesin</th>
                                    <th className="py-1">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="text-yellow-800">
                                {skippedEntries.map((entry, idx) => (
                                    <tr key={idx} className="border-t border-yellow-100">
                                        <td className="py-1 pr-2 font-mono">{entry.machineEmployeeCode}</td>
                                        <td className="py-1 pr-2">{entry.employeeName}</td>
                                        <td className="py-1">{entry.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-yellow-700 text-xs">
                        Pastikan NIP pegawai di sistem sesuai dengan ID di mesin absensi, atau nama pegawai cocok.
                    </p>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Catatan:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pilih file berformat <code className="bg-gray-100 px-1 rounded">.txt</code> yang ditarik dari mesin absensi.</li>
                    <li>Sistem akan mencocokkan ID Mesin (EnNo) atau Nama dengan data Pegawai.</li>
                    <li>Jika ada dua log (masuk & keluar) pada tanggal yang sama, sistem akan menghitung durasi jam kerja secara otomatis.</li>
                    <li>Data yang tidak cocok dengan pegawai manapun akan dilewati dan dilaporkan.</li>
                </ul>
            </div>
        </div>
    );
};

export default LogMachineUpload;
