# Employee Module Hooks Documentation

## Overview

This document describes the custom React hooks used in the Employee module for data fetching and management.

## Hooks

### 1. usePegawaiList

Fetches the list of all employees.

#### Usage
```typescript
import { usePegawaiList } from '../hooks/usePegawaiQuery';

const { data: pegawai, isLoading, error, refetch } = usePegawaiList();
```

#### Return Values
- `data`: Array of employee objects
- `isLoading`: Boolean indicating if data is being fetched
- `error`: Error object if request fails
- `refetch`: Function to manually refetch data

### 2. usePegawai

Fetches details of a specific employee by ID.

#### Usage
```typescript
import { usePegawai } from '../hooks/usePegawai';

const { pegawai, loading, error } = usePegawai(employeeId);
```

#### Parameters
- `employeeId`: String ID of the employee to fetch

#### Return Values
- `pegawai`: Employee object
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if request fails

### 3. useRiwayatJabatan

Fetches job history for a specific employee.

#### Usage
```typescript
import { useRiwayatJabatan } from '../hooks/useRiwayatJabatan';

const { riwayatJabatan, loading, error } = useRiwayatJabatan(employeeId);
```

#### Parameters
- `employeeId`: String ID of the employee

#### Return Values
- `riwayatJabatan`: Array of job history objects
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if request fails

### 4. usePelatihan

Fetches training records for a specific employee.

#### Usage
```typescript
import { usePelatihan } from '../hooks/usePelatihan';

const { pelatihan, loading, error } = usePelatihan(employeeId);
```

#### Parameters
- `employeeId`: String ID of the employee

#### Return Values
- `pelatihan`: Array of training objects
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if request fails

## Implementation Details

### usePegawaiList
Located in `src/features/01-pegawai/hooks/usePegawaiQuery.ts`
Uses React Query's `useQuery` to fetch employee list with caching.

### usePegawai
Located in `src/features/01-pegawai/hooks/usePegawai.ts`
Custom hook that fetches employee details by ID.

### useRiwayatJabatan
Located in `src/features/01-pegawai/hooks/useRiwayatJabatan.ts`
Custom hook that fetches job history for an employee.

### usePelatihan
Located in `src/features/01-pegawai/hooks/usePelatihan.ts`
Custom hook that fetches training records for an employee.

## Data Flow

1. Components call hooks to fetch data
2. Hooks use React Query for caching and state management
3. API services handle actual HTTP requests
4. Data is transformed and returned to components
5. Components re-render when data changes

## Error Handling

All hooks include error handling:
- Network errors are caught and returned
- Loading states are managed automatically
- Retry mechanisms are built into React Query
- Components can handle errors appropriately

## Testing

Each hook should be tested for:
- Successful data fetching
- Loading states
- Error conditions
- Data transformation
- Cache invalidation