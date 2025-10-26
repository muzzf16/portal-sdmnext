// src/shared/components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx('bg-white shadow-card rounded-xl p-6 border border-gray-200', className)}>
    {children}
  </div>
);

export default Card;