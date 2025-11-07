import ApiService from './apiService';

// Define the Kinerja type (you may want to import this from types)
interface Kinerja {
  id: string;
  employee_id: number;
  employeeName: string;
  period: string;
  reviewerName: string;
  reviewDate: string;
  overallScore: number;
  status: string;
  strengths: string;
  areasForImprovement: string;
  employeeFeedback: string;
  kpis: any[];
}

// Create an instance of ApiService for performance operations
const performanceApi = new ApiService<Kinerja>('/performance-reviews');

// Export the standardized methods
export const getPerformanceReviews = () => performanceApi.list();

// Export the instance in case other methods are needed
export default performanceApi;
