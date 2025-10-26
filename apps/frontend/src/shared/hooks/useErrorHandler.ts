// src/shared/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export interface ErrorOptions {
  message?: string;
  showNotification?: boolean;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);
  const { addToast } = useToast();

  const handleError = useCallback((err: any, options: ErrorOptions = {}) => {
    const errorMessage = options.message || err.message || 'An unexpected error occurred';
    
    setError(err);
    
    if (options.logError !== false) {
      console.error('Error handled:', err);
    }
    
    if (options.showNotification !== false) {
      addToast(errorMessage, 'error');
    }
    
    return errorMessage;
  }, [addToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};