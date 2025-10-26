// src/shared/components/ui/Toast.tsx
import React from 'react';
import clsx from 'clsx';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const Toast: React.FC<ToastMessage> = ({ id, message, type }) => {
  const baseClasses = "flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse rounded-lg shadow text-gray-400 bg-gray-800 divide-gray-700";
  
  const icons = {
    success: (
      <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
    ),
    error: (
      <XCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
    ),
    info: (
      <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />
    )
  };

  return (
    <div id={`toast-${id}`} className={clsx(baseClasses, "mb-2")} role="alert">
      <div className="text-sm font-normal">{icons[type]}</div>
      <div className="ps-4 text-sm font-normal">{message}</div>
      <button 
        className="pl-4 text-gray-400 hover:text-white"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;