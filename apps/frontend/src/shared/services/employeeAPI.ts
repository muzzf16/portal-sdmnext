import ApiService from './apiService';
import { Pegawai } from '../types/types';

// Create an instance of ApiService for employee operations
const employeeApi = new ApiService<Pegawai>('/employees');

// Export the standardized methods
export const getEmployees = async () => {
  try {
    const response = await employeeApi.list();
    console.log('getEmployees response:', response); // Debug log
    return response;
  } catch (error) {
    console.error('Error in getEmployees:', error);
    throw error;
  }
};

export const getEmployee = (id: string) => employeeApi.get(id);
export const createEmployee = (employee: Omit<Pegawai, 'id'>) => employeeApi.create(employee);
export const updateEmployee = (id: string, employee: Partial<Pegawai>) => employeeApi.update(id, employee);
export const deleteEmployee = (id: string) => employeeApi.delete(id);

// Chart data functions - updated to call new backend endpoints
import api from './api';

export const getEmployeeGenderData = async () => {
  try {
    const response = await api.get('/employees/charts/gender-distribution'); // This will be prefixed with /api by the axios config
    console.log('getEmployeeGenderData response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getEmployeeGenderData:', error);
    throw error;
  }
};

export const getEmployeeEducationData = async () => {
  try {
    const response = await api.get('/employees/charts/education-distribution'); // This will be prefixed with /api by the axios config
    console.log('getEmployeeEducationData response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getEmployeeEducationData:', error);
    throw error;
  }
};

// Export the instance in case other methods are needed
export default employeeApi;
