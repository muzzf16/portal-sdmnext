import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from wherever you're storing it (localStorage, context, etc.)
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error is a 401 and not a retry, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Implement token refresh logic
        // This would call your token refresh endpoint
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Make a request to refresh the token
          const refreshResponse = await axios.post('/api/auth/refresh', {
            refreshToken
          });
          
          const { accessToken } = refreshResponse.data;
          
          // Store the new access token
          localStorage.setItem('accessToken', accessToken);
          
          // Retry the original request with the new token
          if (originalRequest.headers) {
            (originalRequest.headers as any).Authorization = `Bearer ${accessToken}`;
          }
          
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;