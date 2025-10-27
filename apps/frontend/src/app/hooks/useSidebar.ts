import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768; // px

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= MOBILE_BREAKPOINT);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        closeSidebar();
      } else {
        openSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [closeSidebar, openSidebar]);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
};
