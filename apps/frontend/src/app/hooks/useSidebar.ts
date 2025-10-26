// src/app/hooks/useSidebar.ts
import { useState, useCallback, useEffect } from 'react';

interface UseSidebarReturn {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const useSidebar = (): UseSidebarReturn => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // Auto-close sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Tailwind's md breakpoint
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    const closeOnMobile = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    // Close sidebar on initial load if mobile
    closeOnMobile();

    // Listen for route changes (this is a simplified approach)
    // In a real app, you might want to use React Router's events
    const handleRouteChange = () => {
      closeOnMobile();
    };

    // Add event listeners for navigation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };
};