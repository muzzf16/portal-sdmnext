// src/shared/components/ui/Checkbox.tsx
import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, error, className, ...props }) => (
  <div className="flex items-start">
    <div className="flex items-center h-5">
      <input
        id={id}
        type="checkbox"
        {...props}
        className={clsx(
          "h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500",
          error ? "border-red-500" : "",
          className
        )}
      />
    </div>
    <div className="ml-3 text-sm">
      <label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  </div>
);

export default Checkbox;