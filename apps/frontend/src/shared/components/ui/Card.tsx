import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  hover?: boolean;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = true,
}) => {
  const variants = {
    default: 'bg-white dark:bg-neutral-800 shadow-card border border-neutral-100 dark:border-neutral-700/50',
    glass: 'glass',
    bordered: 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600',
    elevated: 'bg-white dark:bg-neutral-800 shadow-elevated',
  };

  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
};
