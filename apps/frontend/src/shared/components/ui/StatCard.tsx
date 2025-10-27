import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'bg-blue-100',
}) => {
  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className={clsx("flex items-center justify-center w-12 h-12 rounded-full", color)}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-white' })}
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};
