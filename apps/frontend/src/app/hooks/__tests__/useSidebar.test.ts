// src/app/hooks/__tests__/useSidebar.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSidebar } from '../useSidebar';

describe('useSidebar', () => {
  beforeEach(() => {
    // Reset window dimensions before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should initialize with sidebar open', () => {
    const { result } = renderHook(() => useSidebar());
    
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it('should toggle sidebar state', () => {
    const { result } = renderHook(() => useSidebar());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isSidebarOpen).toBe(false);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it('should close sidebar', () => {
    const { result } = renderHook(() => useSidebar());
    
    act(() => {
      result.current.closeSidebar();
    });
    
    expect(result.current.isSidebarOpen).toBe(false);
  });

  it('should open sidebar', () => {
    const { result } = renderHook(() => useSidebar());
    
    // First close it
    act(() => {
      result.current.closeSidebar();
    });
    
    expect(result.current.isSidebarOpen).toBe(false);
    
    // Then open it
    act(() => {
      result.current.openSidebar();
    });
    
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it('should close sidebar on mobile screen sizes', () => {
    // Set mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 700, // Mobile size
    });

    const { result } = renderHook(() => useSidebar());
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.isSidebarOpen).toBe(false);
  });

  it('should open sidebar on desktop screen sizes', () => {
    // Set mobile screen size first
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 700, // Mobile size
    });

    const { result } = renderHook(() => useSidebar());
    
    // Trigger resize event to mobile
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.isSidebarOpen).toBe(false);
    
    // Set desktop screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200, // Desktop size
    });
    
    // Trigger resize event to desktop
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.isSidebarOpen).toBe(true);
  });
});