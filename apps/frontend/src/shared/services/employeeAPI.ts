import ApiService, { ApiResponse } from './apiService';
import { Employee } from '../types/types';

// Create an instance of ApiService for employee operations
const employeeApi = new ApiService<Employee>('/employees');

// Export the standardized methods
export const getEmployees = () => employeeApi.list();
export const getEmployee = (id: string) => employeeApi.get(id);
export const createEmployee = (employee: Omit<Employee, 'id'>) => employeeApi.create(employee);
export const updateEmployee = (id: string, employee: Partial<Employee>) => employeeApi.update(id, employee);
export const deleteEmployee = (id: string) => employeeApi.delete(id);

// Export the instance in case other methods are needed
export default employeeApi;
