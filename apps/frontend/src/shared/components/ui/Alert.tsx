// src/shared/components/ui/Alert.tsx
import React from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ children, variant = 'info', icon, onClose, className }) => {
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    success: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    danger: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  };

  const iconVariantClasses = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <div className={clsx(
      'rounded-lg p-4 flex items-start',
      variantClasses[variant],
      className
    )}>
      {icon && (
        <div className={clsx('flex-shrink-0 mr-3', iconVariantClasses[variant])}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;