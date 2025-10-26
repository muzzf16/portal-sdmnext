import ApiService, { ApiResponse } from './apiService';

// Define the DataChangeRequest type (you may want to import this from types)
interface DataChangeRequest {
  id: string;
  employee_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  status: string;
  created_at: string;
}

// Create an instance of ApiService for data change request operations
const dataChangeRequestApi = new ApiService<DataChangeRequest>('/data-change-requests');

// Export the standardized methods
export const getDataChangeRequests = () => dataChangeRequestApi.list();

// Export the instance in case other methods are needed
export default dataChangeRequestApi;
