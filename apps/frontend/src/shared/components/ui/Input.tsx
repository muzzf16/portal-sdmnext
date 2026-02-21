import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  hint,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
      >
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={clsx(
            'block w-full rounded-xl border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500',
            'text-sm py-2.5 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            icon ? 'pl-10 pr-3' : 'px-3.5',
            error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-600'
              : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500/20 focus:border-primary-500',
            props.disabled && 'bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>
      )}
    </div>
  );
};
