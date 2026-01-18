import React from 'react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { TrendingUp, DollarSign, PieChart, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortfolioOverview({ investments }) {
  const calculateMetrics = () => {
    if (!investments.length) return { total: 0, active: 0, avgIRR: 0, avgMoIC: 0 };

    const total = investments.reduce((sum, inv) => sum + inv.investment_amount, 0);
    const active = investments.filter(inv => inv.status === 'Active').length;
    
    const irrValues = investments.filter(inv => inv.irr).map(inv => inv.irr);
    const avgIRR = irrValues.length ? irrValues.reduce((a, b) => a + b, 0) / irrValues.length : 0;
    
    const moicValues = investments.filter(inv => inv.moic).map(inv => inv.moic);
    const avgMoIC = moicValues.length ? moicValues.reduce((a, b) => a + b, 0) / moicValues.length : 0;

    return { total, active, avgIRR, avgMoIC };
  };

  const metrics = calculateMetrics();

  const cards = [
    {
      label: 'Total Invested',
      value: `$${(metrics.total / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Active Investments',
      value: metrics.active,
      icon: PieChart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Avg IRR',
      value: `${metrics.avgIRR.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Avg MoIC',
      value: `${metrics.avgMoIC.toFixed(2)}x`,
      icon: Target,
      color: 'from-orange-500 to-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <CinematicCard variant="glass" hover glow glowColor="cyan">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-sm text-slate-400">{card.label}</div>
            </div>
          </CinematicCard>
        </motion.div>
      ))}
    </div>
  );
}