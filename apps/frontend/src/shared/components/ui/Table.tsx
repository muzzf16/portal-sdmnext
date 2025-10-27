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
    <div className="overflow-x-auto relative shadow-soft-shadow sm:rounded-lg">
      <table className={clsx("w-full text-sm text-left text-gray-500 dark:text-gray-400", className)}>
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="py-3 px-6 border-b border-gray-200 dark:border-gray-600">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                className: clsx(
                  'bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600',
                  child.props.className
                ),
                children: React.Children.map(child.props.children, (cell) => {
                  if (React.isValidElement(cell) && cell.type === 'td') {
                    return React.cloneElement(cell, {
                      className: clsx('py-4 px-6', cell.props.className)
                    });
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
