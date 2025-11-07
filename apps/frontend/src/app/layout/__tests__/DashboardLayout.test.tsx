// src/app/layout/__tests__/DashboardLayout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/shared/contexts/AuthContext';
import { useSidebar } from '@/app/hooks/useSidebar';
import DashboardLayout from '../DashboardLayout';

// Mock the useSidebar hook
jest.mock('@/app/hooks/useSidebar', () => ({
  useSidebar: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  BarChart: () => <div data-testid="bar-chart-icon" />,
  UserCheck: () => <div data-testid="user-check-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  File: () => <div data-testid="file-icon" />,
  Search: () => <div data-testid="search-icon" />,
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DashboardLayout', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
  };

  const mockAuthContext = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  };

  const mockUseSidebar = {
    isSidebarOpen: true,
    toggleSidebar: jest.fn(),
    closeSidebar: jest.fn(),
    openSidebar: jest.fn(),
  };

  beforeEach(() => {
    (useSidebar as jest.Mock).mockReturnValue(mockUseSidebar);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with sidebar open', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardLayout />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Check if main elements are rendered
    expect(screen.getByText('SDM BPRBAPERA BATANG')).toBeInTheDocument();
    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    expect(screen.getByText('employee.title')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check if sidebar is open
    expect(screen.getByLabelText('Main navigation menu')).toBeInTheDocument();
  });

  it('renders correctly with sidebar collapsed', () => {
    (useSidebar as jest.Mock).mockReturnValue({
      ...mockUseSidebar,
      isSidebarOpen: false,
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardLayout />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Check if sidebar is collapsed
    expect(screen.getByLabelText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('SDM')).toBeInTheDocument();
  });

  it('calls toggleSidebar when sidebar toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardLayout />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const toggleButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(toggleButton);
    
    expect(mockUseSidebar.toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('calls logout when logout button is clicked', () => {
    window.confirm = jest.fn(() => true); // Mock confirm dialog
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{...mockAuthContext, logout: jest.fn()}}>
          <DashboardLayout />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByLabelText('auth.logout');
    fireEvent.click(logoutButton);
    
    expect(window.confirm).toHaveBeenCalledWith('auth.logoutConfirm');
  });

  it('renders navigation items correctly', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardLayout />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Check if navigation items are rendered
    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    expect(screen.getByText('employee.title')).toBeInTheDocument();
    expect(screen.getByText('attendance.title')).toBeInTheDocument();
    expect(screen.getByText('leave.title')).toBeInTheDocument();
    expect(screen.getByText('payroll.title')).toBeInTheDocument();
  });
});