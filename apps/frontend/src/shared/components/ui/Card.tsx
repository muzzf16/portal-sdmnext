import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow-md', className)}>
      {children}
    </div>
  );
};
