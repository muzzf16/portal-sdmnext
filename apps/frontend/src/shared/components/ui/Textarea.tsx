// src/shared/components/ui/Textarea.tsx
import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      {...props}
      rows={4}
      className={clsx(
        "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary-orange focus:border-secondary-orange focus:ring-2 focus:ring-offset-0 transition-colors",
        error ? "border-red-500" : "",
        className
      )}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default Textarea;