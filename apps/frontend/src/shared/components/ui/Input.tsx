// src/shared/components/ui/Input.tsx
import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={clsx(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary-orange focus:border-secondary-orange focus:ring-2 focus:ring-offset-0 transition-colors",
        error ? "border-red-500" : "",
        className
      )}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Input;