import React from 'react';

interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  children,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
      {children && <div>{children}</div>}
    </div>
  );
};
