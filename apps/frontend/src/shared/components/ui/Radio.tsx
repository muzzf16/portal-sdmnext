// src/shared/components/ui/Radio.tsx
import React from 'react';
import clsx from 'clsx';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Radio: React.FC<RadioProps> = ({ label, id, error, className, ...props }) => (
  <div className="flex items-center">
    <input
      id={id}
      type="radio"
      {...props}
      className={clsx(
        "h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500",
        error ? "border-red-500" : "",
        className
      )}
    />
    <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Radio;