// src/shared/services/apiService.ts
// Generic API service functions to standardize API calls across features
// Provides consistent interface for all API operations

import api from './api';

/**
 * Response interface for all API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

/**
 * Parameters interface for list operations
 */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

/**
 * Generic API service class to standardize API calls across features
 * Provides CRUD operations with consistent response format
 */
class ApiService<T = any> {
  private endpoint: string;

  /**
   * Creates an instance of ApiService
   * @param endpoint - The API endpoint for this service
   */
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Fetches a list of resources
   * @param params - Optional parameters for filtering, pagination, etc.
   * @returns Promise containing the API response with an array of resources
   */
  async list(params?: ListParams): Promise<ApiResponse<T[]>> {
    const response = await api.get<ApiResponse<T[]> | T[]>(this.endpoint, {
      params
    });
    // Handle both standardized response format and direct array format
    if (Array.isArray(response.data)) {
      // If response.data is directly an array, wrap it in a standardized response
      return { success: true, data: response.data } as ApiResponse<T[]>;
    } else {
      // If response is already in standardized format, return as is
      return response.data as ApiResponse<T[]>;
    }
  }

  /**
   * Fetches a single resource by ID
   * @param id - The ID of the resource to fetch
   * @returns Promise containing the API response with a single resource
   */
  async get(id: string | number): Promise<ApiResponse<T>> {
    const response = await api.get<ApiResponse<T> | T>(`${this.endpoint}/${id}`);
    // Handle both standardized response format and direct object format
    if ((response.data as any).success !== undefined) {
      // If response is already in standardized format, return as is
      return response.data as ApiResponse<T>;
    } else {
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: response.data as T };
    }
  }

  /**
   * Creates a new resource
   * @param data - The data for the new resource
   * @returns Promise containing the API response with the created resource
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await api.post<ApiResponse<T> | T>(this.endpoint, data);
    // Handle both standardized response format and direct object format
    if ((response.data as any).success !== undefined) {
      // If response is already in standardized format, return as is
      return response.data as ApiResponse<T>;
    } else {
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: response.data as T };
    }
  }

  /**
   * Updates an existing resource
   * @param id - The ID of the resource to update
   * @param data - The updated data for the resource
   * @returns Promise containing the API response with the updated resource
   */
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await api.put<ApiResponse<T> | T>(`${this.endpoint}/${id}`, data);
    // Handle both standardized response format and direct object format
    if ((response.data as any).success !== undefined) {
      // If response is already in standardized format, return as is
      return response.data as ApiResponse<T>;
    } else {
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: response.data as T };
    }
  }

  /**
   * Deletes a resource
   * @param id - The ID of the resource to delete
   * @returns Promise containing the API response indicating success
   */
  async delete(id: string | number): Promise<ApiResponse<boolean>> {
    const response = await api.delete<ApiResponse<boolean> | boolean>(`${this.endpoint}/${id}`);
    // Handle both standardized response format and direct boolean format
    if (typeof response.data === 'boolean') {
      // If response.data is directly a boolean, wrap it in a standardized response
      return { success: true, data: response.data };
    } else {
      // If response is already in standardized format, return as is
      return response.data as ApiResponse<boolean>;
    }
  }
}

export default ApiService;