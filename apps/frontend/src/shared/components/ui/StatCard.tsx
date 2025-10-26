// src/shared/components/ui/StatCard.tsx
import React from 'react';
import clsx from 'clsx';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="flex items-center p-4 hover:shadow-elegant transition-shadow duration-200">
    <div className={clsx('p-3 rounded-full mr-4', color)}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </Card>
);

export default StatCard;