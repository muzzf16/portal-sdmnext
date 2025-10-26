import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 bg-gray-100 min-h-screen">
      {children}
    </main>
  );
};

export default LayoutWrapper;
