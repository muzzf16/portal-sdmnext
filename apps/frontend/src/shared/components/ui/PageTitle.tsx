// src/shared/components/ui/PageTitle.tsx
import React from 'react';

interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, children }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div>{children}</div>
  </div>
);

export default PageTitle;