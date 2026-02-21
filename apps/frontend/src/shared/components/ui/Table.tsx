import React from 'react';
import clsx from 'clsx';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-neutral-800">
      <table className={clsx("w-full text-sm text-left", className)}>
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700/50">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                className: clsx(
                  'text-neutral-700 dark:text-neutral-300 hover:bg-primary-50/50 dark:hover:bg-neutral-700/30 transition-colors duration-150',
                  child.props.className
                ),
                children: React.Children.map(child.props.children, (cell) => {
                  if (React.isValidElement(cell) && cell.type === 'td') {
                    const cellProps = cell.props as { className?: string };
                    return React.cloneElement(cell as React.ReactElement, {
                      className: clsx('px-6 py-4', cellProps.className)
                    } as any);
                  }
                  return cell;
                })
              });
            }
            return child;
          })}
        </tbody>
      </table>
    </div>
  );
};
