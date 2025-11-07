import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Absensi } from '../../../shared/types/types';
import { createAbsensi } from '../api/absensiApi';

interface ExcelUploadProps {
  onUploadComplete?: () => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (absensiData: Omit<Absensi, 'id'>[]) => {
      // Process the attendance data - we'll create each record individually for now
      return Promise.all(absensiData.map(data => createAbsensi({
        ...data,
        clockOut: data.clockOut ?? '',
        workDuration: data.workDuration ?? ''
      })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absensi'] });
      setLoading(false);
      setError(null);
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Gagal mengunggah data absensi dari Excel');
      setLoading(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const data = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and transform the data to match the Absensi interface
      const absensiData = jsonData.map((row: any) => {
        // Validate required fields
        if (!row.employeeId || !row.date) {
          throw new Error('File Excel harus memiliki kolom employeeId dan date');
        }

        // Parse the data to match the Absensi interface
        return {
          employeeId: String(row.employeeId),
          employeeName: String(row.employeeName || ''),
          date: String(row.date),
          clockIn: String(row.clockIn || ''),
          clockOut: row.clockOut ? String(row.clockOut) : '',
          status: String(row.status || 'hadir'),
          workDuration: String(row.workDuration || ''),
          notes: String(row.notes || '')
        };
      });

      // Execute the mutation to save all attendance records
      mutation.mutate(absensiData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membaca file Excel');
      setLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Gagal membaca file'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="mb-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Unggah Data Absensi dari Excel</h3>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="flex-1 w-full">
          <input
            type="file"
            accept=".xlsx, .xls"
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
          className={`px-4 py-2 rounded-md text-white font-medium ${
            loading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Mengunggah...' : 'Unggah Data'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Format file Excel:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Kolom yang diperlukan: <code className="bg-gray-100 px-1 rounded">employeeId</code>, <code className="bg-gray-100 px-1 rounded">date</code></li>
          <li>Kolom opsional: <code className="bg-gray-100 px-1 rounded">employeeName</code>, <code className="bg-gray-100 px-1 rounded">clockIn</code>, <code className="bg-gray-100 px-1 rounded">clockOut</code>, <code className="bg-gray-100 px-1 rounded">status</code>, <code className="bg-gray-100 px-1 rounded">workDuration</code>, <code className="bg-gray-100 px-1 rounded">notes</code></li>
          <li>Format tanggal: YYYY-MM-DD (Contoh: 2023-12-25)</li>
          <li>Format waktu: HH:mm:ss (Contoh: 08:00:00)</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUpload;