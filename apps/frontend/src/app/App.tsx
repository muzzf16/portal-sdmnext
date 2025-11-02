import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { NotificationProvider } from './providers/NotificationContext';
import { ToastProvider } from './providers/ToastContext';
import { DataProvider } from './providers/DataContext';
import { CompanySettingsProvider } from '@/shared/contexts/CompanySettingsContext';
import ReactQueryProvider from './providers/ReactQueryProvider';
import I18nProvider from './providers/I18nProvider';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference or stored preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('darkMode') !== 'false');
    setDarkMode(isDark);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Provide toggleDarkMode function globally
  React.useEffect(() => {
    (window as any).toggleDarkMode = toggleDarkMode;
  }, [toggleDarkMode]);

  return (
    <Router>
      <ReactQueryProvider>
        <I18nProvider>
          <ToastProvider>
            <NotificationProvider>
              <AuthProvider>
                <CompanySettingsProvider>
                  <DataProvider>
                    <AppRoutes />
                  </DataProvider>
                </CompanySettingsProvider>
              </AuthProvider>
            </NotificationProvider>
          </ToastProvider>
        </I18nProvider>
      </ReactQueryProvider>
    </Router>
  );
};

declare global {
  interface Window {
    toggleDarkMode: () => void;
  }
}

export default App;
