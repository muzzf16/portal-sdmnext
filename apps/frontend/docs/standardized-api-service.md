# Standardized API Service Architecture Documentation

## Overview

This document describes the new standardized API service architecture implemented in the HRMS application. The architecture provides a consistent, type-safe, and robust approach to handling API calls across all features of the application.

## Key Components

### 1. ApiService Class
The core of the architecture is the `ApiService` class which provides standardized methods for common CRUD operations:
- `list()` - Fetch a list of resources
- `get()` - Fetch a single resource by ID
- `create()` - Create a new resource
- `update()` - Update an existing resource
- `delete()` - Delete a resource

### 2. ApiResponse Interface
All API responses follow a standardized format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}
```

### 3. API Service Files
Each feature has its own API service file that instantiates the `ApiService` class with the appropriate endpoint and type.

## Implementation Details

### ApiService Class Structure
The `ApiService` class is a generic class that takes a type parameter `T` representing the resource type:

```typescript
class ApiService<T = any> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async list(params?: ListParams): Promise<ApiResponse<T[]>> {
    // Implementation
  }

  async get(id: string | number): Promise<ApiResponse<T>> {
    // Implementation
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    // Implementation
  }

  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    // Implementation
  }

  async delete(id: string | number): Promise<ApiResponse<boolean>> {
    // Implementation
  }
}
```

### Usage Example
```typescript
// Create an instance for employee operations
const employeeApi = new ApiService<Employee>('/employees');

// Use the standardized methods
const employees = await employeeApi.list();
const employee = await employeeApi.get('123');
const newEmployee = await employeeApi.create({ name: 'John Doe', email: 'john@example.com' });
const updatedEmployee = await employeeApi.update('123', { name: 'Jane Doe' });
const deleted = await employeeApi.delete('123');
```

### API Service Files
Each feature implements its own API service file:

```typescript
// src/shared/services/employeeAPI.ts
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
```

## Benefits

### 1. Consistency
- All API calls follow the same pattern
- Standardized response format across all endpoints
- Consistent error handling

### 2. Type Safety
- Strong typing with TypeScript generics
- Compile-time error checking
- Better IDE support with autocomplete

### 3. Maintainability
- Centralized API service logic
- Easy to update and modify
- Reduced code duplication

### 4. Performance
- Built-in caching with React Query integration
- Efficient data fetching
- Optimistic updates

### 5. Error Handling
- Standardized error response format
- Automatic error logging
- Graceful failure handling

## Migration Guide

### From Old API Calls
Old direct API calls like:
```typescript
api.get<Employee[]>('/employees')
```

Should be replaced with:
```typescript
const employeeApi = new ApiService<Employee>('/employees');
employeeApi.list()
```

Or using the feature-specific API service:
```typescript
import { getEmployees } from '../services/employeeAPI';
getEmployees()
```

### Updating Components
Components that previously used direct API calls should be updated to use the new service methods or React Query hooks.

## Testing

The standardized API service architecture makes testing easier:
- Mock the ApiService instance for unit tests
- Test each method independently
- Verify response format consistency

## Best Practices

### 1. Use Feature-Specific API Services
Create dedicated API service files for each feature rather than using the base ApiService directly.

### 2. Type Everything
Always provide proper TypeScript types for API responses and parameters.

### 3. Handle Errors Gracefully
Always implement proper error handling in API service methods.

### 4. Use React Query for Caching
Integrate with React Query for efficient data fetching and caching.

### 5. Follow REST Conventions
Use standard REST endpoints and HTTP methods.

## Extending the Architecture

### Adding New Methods
To add feature-specific methods, extend the ApiService instance:
```typescript
const extendedEmployeeApi = {
  ...employeeApi,
  getActiveEmployees: () => api.get<Employee[]>('/employees?status=active')
};
```

### Custom Endpoints
For complex endpoints, create custom methods in the feature API service:
```typescript
export const getEmployeeStats = async (id: string) => {
  const response = await api.get(`/employees/${id}/stats`);
  return response.data;
};
```

## Troubleshooting

### Common Issues
1. **Type Errors**: Ensure proper TypeScript types are provided
2. **Response Format Mismatch**: Check that backend returns standardized format
3. **CORS Issues**: Verify API endpoint configuration
4. **Authentication Errors**: Check auth token handling

### Debugging Tips
1. Use browser dev tools to inspect network requests
2. Check console for error messages
3. Verify API endpoint URLs
4. Test endpoints with tools like Postman

## Future Enhancements

### Planned Improvements
1. Add request/response interceptors for global error handling
2. Implement automatic retry mechanisms
3. Add request cancellation support
4. Enhance caching strategies
5. Add offline support with service workers

### Integration Opportunities
1. Connect with monitoring services like Sentry
2. Integrate with analytics platforms
3. Add performance tracking
4. Implement request logging