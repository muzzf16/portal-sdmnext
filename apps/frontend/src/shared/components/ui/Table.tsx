// src/shared/components/ui/Table.tsx
import React from 'react';
import clsx from 'clsx';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, children, className }) => (
  <div className="overflow-x-auto">
    <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
      <thead className="bg-gray-50 dark:bg-neutral-700">
        <tr>
          {headers.map((header, index) => (
            <th 
              key={index} 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
        {children}
      </tbody>
    </table>
  </div>
);

export default Table;