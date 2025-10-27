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

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  icon,
  onClose,
  className,
}) => {
  const variantStyles = {
    info: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
    success: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    danger: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
  };

  return (
    <div
      className={clsx(
        'p-4 rounded-md border flex items-center justify-between',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex items-center">
        {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
        <div className="text-sm font-medium">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-current rounded-lg focus:ring-2 focus:ring-current p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8 dark:hover:bg-opacity-30"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
