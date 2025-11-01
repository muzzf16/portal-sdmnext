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

// Transform snake_case to camelCase for frontend compatibility
const transformToCamelCase = (data: any): any => {
  if (data === null || typeof data !== 'object' || data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => transformToCamelCase(item));
  }

  const transformed: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      transformed[camelCaseKey] = transformToCamelCase(data[key]);
    }
  }
  return transformed;
};

// Transform camelCase to snake_case for API compatibility
const transformToSnakeCase = (data: any): any => {
  if (data === null || typeof data !== 'object' || data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => transformToSnakeCase(item));
  }

  const transformed: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const snakeCaseKey = key.replace(/[A-Z]/g, (g) => `_${g.toLowerCase()}`);
      transformed[snakeCaseKey] = transformToSnakeCase(data[key]);
    }
  }
  return transformed;
};

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
      // Transform response from snake_case to camelCase
      const transformedData = response.data.map(item => transformToCamelCase(item));
      // If response.data is directly an array, wrap it in a standardized response
      return { success: true, data: transformedData } as ApiResponse<T[]>;
    } else {
      // Transform response data if it's in standardized format
      const standardResponse = response.data as ApiResponse<T[]>;
      if (standardResponse.data && Array.isArray(standardResponse.data)) {
        const transformedData = standardResponse.data.map(item => transformToCamelCase(item));
        return { ...standardResponse, data: transformedData } as ApiResponse<T[]>;
      }
      return standardResponse;
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
      // Transform response data if it's in standardized format
      const standardResponse = response.data as ApiResponse<T>;
      if (standardResponse.data) {
        const transformedData = transformToCamelCase(standardResponse.data);
        return { ...standardResponse, data: transformedData } as ApiResponse<T>;
      }
      return standardResponse;
    } else {
      // Transform response from snake_case to camelCase
      const transformedData = transformToCamelCase(response.data);
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: transformedData as T };
    }
  }

  /**
   * Creates a new resource
   * @param data - The data for the new resource
   * @returns Promise containing the API response with the created resource
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    // Transform request from camelCase to snake_case
    const transformedData = transformToSnakeCase(data);
    const response = await api.post<ApiResponse<T> | T>(this.endpoint, transformedData);
    // Handle both standardized response format and direct object format
    if ((response.data as any).success !== undefined) {
      // Transform response data if it's in standardized format
      const standardResponse = response.data as ApiResponse<T>;
      if (standardResponse.data) {
        const transformedResponseData = transformToCamelCase(standardResponse.data);
        return { ...standardResponse, data: transformedResponseData } as ApiResponse<T>;
      }
      return standardResponse;
    } else {
      // Transform response from snake_case to camelCase
      const transformedData = transformToCamelCase(response.data);
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: transformedData as T };
    }
  }

  /**
   * Updates an existing resource
   * @param id - The ID of the resource to update
   * @param data - The updated data for the resource
   * @returns Promise containing the API response with the updated resource
   */
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    // Transform request from camelCase to snake_case
    const transformedData = transformToSnakeCase(data);
    const response = await api.put<ApiResponse<T> | T>(`${this.endpoint}/${id}`, transformedData);
    // Handle both standardized response format and direct object format
    if ((response.data as any).success !== undefined) {
      // Transform response data if it's in standardized format
      const standardResponse = response.data as ApiResponse<T>;
      if (standardResponse.data) {
        const transformedResponseData = transformToCamelCase(standardResponse.data);
        return { ...standardResponse, data: transformedResponseData } as ApiResponse<T>;
      }
      return standardResponse;
    } else {
      // Transform response from snake_case to camelCase
      const transformedData = transformToCamelCase(response.data);
      // If response.data is directly the object, wrap it in a standardized response
      return { success: true, data: transformedData as T };
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