import React from 'react';
import clsx from 'clsx';
import { Info, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  onClose?: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onClose,
}) => {
  const config = {
    info: {
      bg: 'bg-white dark:bg-neutral-800 border-sky-200 dark:border-sky-800',
      icon: <Info size={18} className="text-sky-500" />,
      accent: 'bg-sky-500',
      text: 'text-neutral-700 dark:text-neutral-200',
    },
    success: {
      bg: 'bg-white dark:bg-neutral-800 border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle size={18} className="text-emerald-500" />,
      accent: 'bg-emerald-500',
      text: 'text-neutral-700 dark:text-neutral-200',
    },
    error: {
      bg: 'bg-white dark:bg-neutral-800 border-red-200 dark:border-red-800',
      icon: <XCircle size={18} className="text-red-500" />,
      accent: 'bg-red-500',
      text: 'text-neutral-700 dark:text-neutral-200',
    },
    warning: {
      bg: 'bg-white dark:bg-neutral-800 border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle size={18} className="text-amber-500" />,
      accent: 'bg-amber-500',
      text: 'text-neutral-700 dark:text-neutral-200',
    },
  };

  const { bg, icon, accent, text } = config[type] || config.info;

  return (
    <div
      className={clsx(
        'relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl shadow-elevated border mb-3 animate-slideInRight overflow-hidden',
        bg
      )}
      role="alert"
    >
      {/* Left accent bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', accent)} />

      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <p className={clsx('text-sm font-medium flex-1', text)}>{message}</p>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
