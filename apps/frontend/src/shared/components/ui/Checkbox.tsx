import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  error,
  className,
  ...props
}) => {
  return (
    <div className="mb-4 flex items-center">
      <input
        id={id}
        type="checkbox"
        className={clsx(
          'h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
