import api from '../../../shared/services/api';
import { Lamaran } from '../types';

// Transform camelCase to snake_case for API compatibility
const transformToSnakeCase = (data: any) => {
  const transformed: any = {};
  Object.keys(data).forEach(key => {
    switch(key) {
      case 'positionApplied':
        transformed.position_applied = data[key];
        break;
      case 'resumeUrl':
        transformed.resume_url = data[key];
        break;
      case 'coverLetter':
        transformed.cover_letter = data[key];
        break;
      case 'applicationDate':
        transformed.application_date = data[key];
        break;
      default:
        transformed[key] = data[key];
    }
  });
  return transformed;
};

// Transform snake_case to camelCase for frontend compatibility
const transformToCamelCase = (data: any) => {
  const transformed: any = {};
  Object.keys(data).forEach(key => {
    switch(key) {
      case 'position_applied':
        transformed.positionApplied = data[key];
        break;
      case 'resume_url':
        transformed.resumeUrl = data[key];
        break;
      case 'cover_letter':
        transformed.coverLetter = data[key];
        break;
      case 'application_date':
        transformed.applicationDate = data[key];
        break;
      default:
        transformed[key] = data[key];
    }
  });
  return transformed;
};

export const getLamaran = async () => {
  const response = await api.get<any[]>('/recruitment/candidates');
  // Transform response from snake_case to camelCase
  const transformedData = response.data.map(item => transformToCamelCase(item));
  return { ...response, data: transformedData as Lamaran[] };
};

export const buatLamaran = (lamaranData: Omit<Lamaran, 'id'>) => {
  // Transform request from camelCase to snake_case
  const transformedData = transformToSnakeCase(lamaranData);
  return api.post<Lamaran>('/recruitment/candidates', transformedData);
};
