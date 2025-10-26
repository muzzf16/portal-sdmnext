# Testing Documentation

## Overview

This document provides guidelines and best practices for testing components and services in the HRMS application.

## Testing Frameworks

The application uses the following testing frameworks:

1. **Jest** - JavaScript testing framework
2. **React Testing Library** - For testing React components
3. **@testing-library/jest-dom** - Custom jest matchers for DOM assertions

## Test Structure

Tests should be organized in a `__tests__` directory within each component or service folder.

### Component Tests
Component tests should be placed in `__tests__` directories adjacent to the components they test:

```
src/
├── features/
│   └── 01-pegawai/
│       ├── components/
│       │   ├── DaftarPegawai.tsx
│       │   └── __tests__/
│       │       └── DaftarPegawai.test.tsx
│       └── pages/
│           ├── HalamanPegawai.tsx
│           └── __tests__/
│               └── HalamanPegawai.test.tsx
```

### Service Tests
Service tests should be placed in `__tests__` directories adjacent to the services they test:

```
src/
├── shared/
│   └── services/
│       ├── employeeAPI.ts
│       └── __tests__/
│           └── employeeAPI.test.ts
```

## Writing Tests

### Component Tests
Use React Testing Library for component tests. Focus on testing user interactions and expected behaviors rather than implementation details.

#### Example Component Test
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DaftarPegawai } from '../components/DaftarPegawai';

describe('DaftarPegawai Component', () => {
  it('renders employee list correctly', () => {
    const mockEmployees = [
      { id: 1, name: 'John Doe', position: 'Developer' },
      { id: 2, name: 'Jane Smith', position: 'Designer' }
    ];

    render(<DaftarPegawai employees={mockEmployees} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    render(<DaftarPegawai loading={true} />);

    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    render(<DaftarPegawai error="Failed to fetch employees" />);

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});
```

### Service Tests
Use Jest for service tests. Mock API calls and test both success and error scenarios.

#### Example Service Test
```ts
import { getEmployees } from '../employeeAPI';
import api from '../../api';

jest.mock('../../api');

describe('employeeAPI', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockClear();
  });

  it('fetches employees successfully', async () => {
    const mockEmployees = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockEmployees });

    const employees = await getEmployees();

    expect(api.get).toHaveBeenCalledWith('/employees');
    expect(employees).toEqual(mockEmployees);
  });

  it('handles API errors', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(getEmployees()).rejects.toThrow('Network error');
  });
});
```

### Hook Tests
Use React Hooks Testing Library for testing custom hooks.

#### Example Hook Test
```ts
import { renderHook, act } from '@testing-library/react';
import { usePegawaiList } from '../hooks/usePegawaiList';

jest.mock('../api/employeeApi');

describe('usePegawaiList Hook', () => {
  it('fetches employee list successfully', async () => {
    const mockEmployees = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];

    (getPegawai as jest.Mock).mockResolvedValue({ data: mockEmployees });

    const { result, waitForNextUpdate } = renderHook(() => usePegawaiList());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.pegawai).toEqual(mockEmployees);
  });

  it('handles fetch errors', async () => {
    (getPegawai as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { result, waitForNextUpdate } = renderHook(() => usePegawaiList());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
```

## Best Practices

### 1. Test User Behavior
Focus on what the user sees and does rather than implementation details:

```tsx
// Good
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// Bad
expect(container.querySelector('.submit-btn')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names
Write clear, descriptive test names that explain what is being tested:

```ts
// Good
it('shows error message when email is invalid', () => { ... });

// Bad
it('shows error', () => { ... });
```

### 3. Mock External Dependencies
Always mock external dependencies like API calls, localStorage, etc.:

```ts
// Mock API service
jest.mock('../api/employeeApi', () => ({
  getPegawai: jest.fn(),
  createPegawai: jest.fn()
}));
```

### 4. Test Edge Cases
Test both happy paths and error scenarios:

```ts
it('handles successful employee creation', async () => { ... });
it('handles employee creation error', async () => { ... });
it('handles network timeout', async () => { ... });
```

### 5. Use Test Data Factories
Create factory functions for test data to avoid repetition:

```ts
const createMockEmployee = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  position: 'Developer',
  ...overrides
});

const mockEmployee = createMockEmployee({ name: 'Jane Smith' });
```

### 6. Clean Up After Tests
Use afterEach or afterAll to clean up mocks and reset state:

```ts
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});
```

## Running Tests

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Configuration
The Jest configuration is defined in `jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Test Setup
Global test setup is defined in `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom';
```

## Coverage

Aim for meaningful test coverage:
- Components: Test rendering, user interactions, and edge cases
- Services: Test success, error, and edge cases
- Hooks: Test all states and transitions
- Utilities: Test all functions with various inputs

## Continuous Integration

Tests are run automatically in the CI pipeline:
1. On every pull request
2. Before merging to main branch
3. On deployment

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**:
   - Check moduleNameMapper in jest.config.js
   - Ensure import paths are correct

2. **Async test timeouts**:
   - Use waitFor or act appropriately
   - Increase test timeout if needed

3. **Mock not working**:
   - Ensure mocks are imported before the component/service
   - Check that the mock is properly defined

4. **Snapshot test failures**:
   - Update snapshots with `npm test -- -u` if intentional changes
   - Review changes to ensure they're expected

### Debugging Tips

1. Use `screen.debug()` to see the current DOM state
2. Use `console.log` for debugging test flow
3. Use `jest.spyOn` to monitor function calls
4. Use `act` for state updates in tests

## Contributing

When adding new features:
1. Write tests before implementing the feature (TDD)
2. Ensure all existing tests pass
3. Add tests for edge cases and error scenarios
4. Update documentation if needed