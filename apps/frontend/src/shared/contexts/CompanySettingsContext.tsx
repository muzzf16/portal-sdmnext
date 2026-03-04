import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCompanySettings as getCompanySettingsApi } from '../services/company-settings.service';

interface CompanySettings {
  companyName?: string;
  logo?: string;
  address?: string;
  // add other settings if needed
}

interface CompanySettingsContextType {
  settings: CompanySettings | null;
  loading: boolean;
  refetch: () => void;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export const CompanySettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = () => {
    setLoading(true);
    getCompanySettingsApi()
      .then((response) => {
        const data = response.data;
        const API_URL = import.meta.env.VITE_API_BASE || '/api';
        const BASE_URL = API_URL.replace(/\/api$/, ''); // Removes '/api' from the end
        if (data.logo) {
          // Strip any http(s) domain prefix from the stored logo path (e.g. http://localhost:3333/logos/... -> /logos/...)
          // This prevents Mixed Content warnings when the site is accessed via HTTPS.
          const relativeLogo = data.logo.replace(/^https?:\/\/[^\/]+/, '');

          if (!relativeLogo.startsWith('http')) {
            data.logo = `${BASE_URL}${relativeLogo}`;
          } else {
            data.logo = relativeLogo;
          }
        }
        setSettings(data);
      })
      .catch((error) => {
        console.error("Failed to fetch company settings:", error);
        setSettings(null); // Set to null or some default on error
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <CompanySettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
};
