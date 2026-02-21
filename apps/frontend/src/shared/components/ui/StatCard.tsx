import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'bg-primary-500',
  trend,
  className,
}) => {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-100 dark:border-neutral-700/50 p-5 group hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      {/* Accent gradient top border */}
      <div className={clsx('absolute top-0 left-0 right-0 h-0.5', color)} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {value}
          </p>
          {trend && (
            <p className={clsx(
              'mt-1.5 text-xs font-medium flex items-center gap-1',
              trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              <svg className={clsx('w-3.5 h-3.5', !trend.positive && 'rotate-180')} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {trend.value}
            </p>
          )}
        </div>
        <div className={clsx(
          'flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-110',
          color, 'bg-opacity-10 dark:bg-opacity-20'
        )}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, {
              className: clsx('w-5 h-5', `text-${color.replace('bg-', '')}`.includes('primary') ? 'text-primary-600' : 'text-current')
            } as any)
            : icon
          }
        </div>
      </div>
    </div>
  );
};
