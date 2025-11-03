import { useState, useEffect } from 'react';
import { getPegawaiById } from '../api/employeeApi';
import { Pegawai, EducationHistory, WorkHistory, TrainingCertificate, PayrollInfo } from '../../types';

const VITE_API_URL = 'http://localhost:3333';

const processPegawaiData = (pegawaiData: any): Pegawai => {
  const processedData = { ...pegawaiData };

  // Construct full avatar URL
  if (processedData.avatarUrl && !processedData.avatarUrl.startsWith('http')) {
    processedData.avatarUrl = `${VITE_API_URL}${processedData.avatarUrl}`;
  }

  // Parse JSON string fields
  try {
    if (typeof processedData.educationHistory === 'string') {
      processedData.educationHistory = JSON.parse(processedData.educationHistory);
    }
    if (typeof processedData.workHistory === 'string') {
      processedData.workHistory = JSON.parse(processedData.workHistory);
    }
    if (typeof processedData.trainingCertificates === 'string') {
      processedData.trainingCertificates = JSON.parse(processedData.trainingCertificates);
    }
    if (typeof processedData.payrollInfo === 'string') {
      processedData.payrollInfo = JSON.parse(processedData.payrollInfo);
    }
  } catch (e) {
    console.error('Failed to parse JSON fields for pegawai:', e);
    // Set to empty arrays/object on parsing failure to prevent crashes
    processedData.educationHistory = Array.isArray(processedData.educationHistory) ? processedData.educationHistory : [];
    processedData.workHistory = Array.isArray(processedData.workHistory) ? processedData.workHistory : [];
    processedData.trainingCertificates = Array.isArray(processedData.trainingCertificates) ? processedData.trainingCertificates : [];
    processedData.payrollInfo = typeof processedData.payrollInfo === 'object' ? processedData.payrollInfo : {};
  }

  return processedData as Pegawai;
}; 

export const usePegawai = (id: string) => {
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPegawai = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await getPegawaiById(id);
        let pegawaiData: any;

        if (response && typeof response === 'object' && 'data' in response) {
          pegawaiData = response.data;
        } else {
          pegawaiData = response;
        }
        
        const processedPegawai = processPegawaiData(pegawaiData);
        setPegawai(processedPegawai);

      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    };

    fetchPegawai();
  }, [id]);

  return { pegawai, loading, error };
};