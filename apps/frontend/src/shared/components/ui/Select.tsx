// src/shared/components/ui/Select.tsx
import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={id}
      {...props}
      className={clsx(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary-orange focus:border-secondary-orange focus:ring-2 focus:ring-offset-0 transition-colors",
        error ? "border-red-500" : "",
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Select;