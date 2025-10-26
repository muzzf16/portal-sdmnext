/**
 * Feature Template for HRMS Application
 * 
 * This template provides a consistent structure for creating new features in the HRMS application.
 * Use this template to maintain consistency across all feature modules.
 */

// Template structure for a new feature
const featureTemplate = {
  name: 'feature-name', // e.g., '01-pegawai', '02-absensi'
  structure: {
    api: {
      fileName: 'featureNameApi.ts',
      description: 'Contains all API service functions for this feature',
      content: `
import api from '../../../shared/services/api';
import { FeatureType } from '../types';

export const getFeatureData = () => api.get<FeatureType[]>('/feature-endpoint');
export const getFeatureDataById = (id: string) => api.get<FeatureType>(\`/feature-endpoint/\${id}\`);
export const createFeatureData = (data: Omit<FeatureType, 'id'>) => api.post<FeatureType>('/feature-endpoint', data);
export const updateFeatureData = (id: string, data: Partial<FeatureType>) => api.put<FeatureType>(\`/feature-endpoint/\${id}\`, data);
export const deleteFeatureData = (id: string) => api.delete(\`/feature-endpoint/\${id}\`);
`
    },
    components: {
      description: 'Reusable UI components specific to this feature',
      examples: ['FeatureList.tsx', 'FeatureForm.tsx', 'FeatureDetail.tsx']
    },
    hooks: {
      fileName: 'useFeatureData.ts',
      description: 'Custom React hooks for data fetching and business logic',
      content: `
import { useState, useEffect, useCallback } from 'react';
import { getFeatureData, createFeatureData, updateFeatureData, deleteFeatureData } from '../api/featureNameApi';
import { FeatureType } from '../types';

export const useFeatureData = () => {
  const [data, setData] = useState<FeatureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFeatureData();
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createData = async (newData: Omit<FeatureType, 'id'>) => {
    try {
      const response = await createFeatureData(newData);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateData = async (id: string, updatedData: Partial<FeatureType>) => {
    try {
      const response = await updateFeatureData(id, updatedData);
      setData(prev => prev.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      await deleteFeatureData(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
    createData,
    updateData,
    deleteData
  };
};
`
    },
    pages: {
      description: 'Route-level components',
      examples: ['FeaturePage.tsx', 'FeatureDetailPage.tsx']
    },
    types: {
      fileName: 'index.ts',
      description: 'TypeScript interfaces for this feature',
      content: `
export interface FeatureType {
  id: string;
  name: string;
  // Add other properties as needed
}
`
    }
  }
};

// Function to create feature directories and files
export const createFeature = (featureName: string, featureDisplayName: string) => {
  console.log(\`Creating feature: \${featureName} (\${featureDisplayName})\`);
  
  // This would typically be used with a script to generate the actual directories and files
  // For now, it just displays the structure as a reference
  console.log(\`Directory: src/features/\${featureName}\`);
  console.log('Sub-directories: api, components, hooks, pages, types');
};

// Export the template for reference
export default featureTemplate;