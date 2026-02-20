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
        if (data.logo && !data.logo.startsWith('http')) {
          // Prepend the base URL if it's a relative path
          data.logo = `${API_URL}${data.logo}`;
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
