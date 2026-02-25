import { useState, useEffect } from 'react';
import { getPegawaiById } from '../api/employeeApi';
import { Pegawai } from '../types';

const processPegawaiData = (pegawaiData: any): Pegawai => {
  const processedData = { ...pegawaiData };

  // Construct full avatar URL
  if (processedData.avatarUrl && !processedData.avatarUrl.startsWith('http')) {
    processedData.avatarUrl = `/api${processedData.avatarUrl}`;
  }

  // Safely parse JSON string fields
  const fieldsToParse = ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo'];

  fieldsToParse.forEach(field => {
    if (typeof processedData[field] === 'string') {
      if (processedData[field] === '[object Object]') {
        // Handle corrupted data
        if (field === 'payrollInfo') {
          processedData[field] = {};
        } else {
          processedData[field] = [];
        }
      } else {
        try {
          processedData[field] = JSON.parse(processedData[field]);
        } catch (e) {
          console.error(`Failed to parse JSON for field ${field}:`, e);
          // Assign a default value based on the expected type
          if (field === 'payrollInfo') {
            processedData[field] = {};
          } else {
            processedData[field] = [];
          }
        }
      }
    } else if (processedData[field] === null || processedData[field] === undefined) {
      if (field === 'payrollInfo') {
        processedData[field] = {};
      } else {
        processedData[field] = [];
      }
    }
  });

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