import React from 'react';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoalComparison({ investments, profile }) {
  if (!profile || !profile.portfolio_goals) {
    return (
      <CinematicCard>
        <div className="p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">Complete your investor profile to see goal comparisons</p>
        </div>
      </CinematicCard>
    );
  }

  const goals = profile.portfolio_goals;

  // Calculate actual metrics
  const actualMetrics = React.useMemo(() => {
    const irrValues = investments.filter(inv => inv.irr).map(inv => inv.irr);
    const avgIRR = irrValues.length ? irrValues.reduce((a, b) => a + b, 0) / irrValues.length : 0;

    const industryAllocation = {};
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investment_amount, 0);
    
    investments.forEach(inv => {
      industryAllocation[inv.industry] = (industryAllocation[inv.industry] || 0) + inv.investment_amount;
    });

    const diversificationScore = Object.keys(industryAllocation).length;

    return { avgIRR, diversificationScore, totalInvested, industryAllocation };
  }, [investments]);

  const comparisons = [
    {
      label: 'Target Annual Return',
      target: goals.target_annual_return,
      actual: actualMetrics.avgIRR,
      unit: '%',
      description: `Goal: ${goals.target_annual_return}% | Actual: ${actualMetrics.avgIRR.toFixed(1)}%`,
    },
    {
      label: 'Diversification',
      target: goals.diversification_preference === 'high' ? 15 : goals.diversification_preference === 'moderate' ? 10 : 5,
      actual: actualMetrics.diversificationScore,
      unit: ' investments',
      description: `Goal: ${goals.diversification_preference} | ${actualMetrics.diversificationScore} unique industries`,
    },
  ];

  const getIcon = (target, actual) => {
    if (actual >= target) return { Icon: TrendingUp, color: 'text-green-400' };
    if (actual >= target * 0.8) return { Icon: Minus, color: 'text-yellow-400' };
    return { Icon: TrendingDown, color: 'text-red-400' };
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <CinematicCard variant="glass" glow glowColor="purple">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Goal Comparison</h3>
              <p className="text-sm text-slate-400">Track progress against your investment targets</p>
            </div>
          </div>

          <div className="grid gap-6">
            {comparisons.map((comp, idx) => {
              const progress = Math.min((comp.actual / comp.target) * 100, 100);
              const { Icon, color } = getIcon(comp.target, comp.actual);

              return (
                <motion.div
                  key={comp.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="font-semibold text-white">{comp.label}</span>
                    </div>
                    <span className="text-slate-300">
                      {comp.actual.toFixed(1)}{comp.unit} / {comp.target}{comp.unit}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-slate-400">{comp.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CinematicCard>

      {/* Time Horizon */}
      <CinematicCard variant="glass">
        <div className="p-6">
          <h4 className="font-semibold text-white mb-4">Time Horizon Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Horizon:</span>
              <span className="text-white font-medium">
                {goals.time_horizon === 'short_term' ? '1-3 years' : 
                 goals.time_horizon === 'medium_term' ? '3-7 years' : '7+ years'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Investments:</span>
              <span className="text-white font-medium">
                {investments.filter(inv => inv.status === 'Active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Investment Age:</span>
              <span className="text-white font-medium">
                {(() => {
                  const ages = investments
                    .filter(inv => inv.investment_date)
                    .map(inv => {
                      const start = new Date(inv.investment_date);
                      const now = new Date();
                      return (now - start) / (365 * 24 * 60 * 60 * 1000);
                    });
                  const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
                  return `${avgAge.toFixed(1)} years`;
                })()}
              </span>
            </div>
          </div>
        </div>
      </CinematicCard>
    </div>
  );
}