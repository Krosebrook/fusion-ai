import React from 'react';
import { StatCard } from '@/components/ui-library';
import { Code, Zap, TrendingUp } from 'lucide-react';

export function DashboardStats({ projectCount = 0 }) {
  const stats = [
    { 
      label: 'Active Projects', 
      value: projectCount, 
      icon: Code, 
      color: '#FF7B00' 
    },
    { 
      label: 'AI Generations', 
      value: '0', 
      icon: Zap, 
      color: '#00B4D8' 
    },
    { 
      label: 'This Month', 
      value: '$0', 
      icon: TrendingUp, 
      color: '#10B981' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}