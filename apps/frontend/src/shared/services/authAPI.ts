// src/shared/services/authAPI.ts
import api from './api';
import { User } from '../types/types';

// Export the direct API methods for auth operations
export const login = (credentials: any) => api.post<User>('/auth/login', credentials);
export const register = (userInfo: any) => api.post<User>('/auth/register', userInfo);
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const refreshToken = (refreshToken: string) => api.post('/auth/refresh', { refreshToken });

export default {
  login,
  register,
  forgotPassword,
  refreshToken
};