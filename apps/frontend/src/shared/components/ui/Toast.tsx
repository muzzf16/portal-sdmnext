import React from 'react';
import clsx from 'clsx';
import { Info, CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  onClose?: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onClose,
}) => {
  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const Icon = {
    info: Info,
    success: CheckCircle,
    error: XCircle,
  }[type];

  return (
    <div
      className={clsx(
        'flex items-center justify-between w-full max-w-xs p-4 text-white rounded-lg shadow-md mb-3',
        typeStyles[type]
      )}
      role="alert"
    >
      <div className="flex items-center">
        <Icon size={20} className="mr-2" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-white p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
