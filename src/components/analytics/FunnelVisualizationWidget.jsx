/**
 * Funnel Visualization Widget — Track conversion paths
 * Displays multi-stage conversion funnel with drop-off analysis
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Filter, TrendingDown, AlertCircle } from 'lucide-react';

export function FunnelVisualizationWidget({ testId }) {
  const { data: funnel, isLoading } = useQuery({
    queryKey: ['funnel-visualization', testId],
    queryFn: async () => {
      const result = await base44.functions.invoke('calculateFunnel', { test_id: testId });
      return result.data?.funnel || [];
    },
    enabled: !!testId,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <CinematicCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-96 bg-white/10 rounded" />
        </div>
      </CinematicCard>
    );
  }

  const maxUsers = funnel?.[0]?.users || 1;

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Conversion Funnel</h3>
          <p className="text-sm text-white/60">Stage-by-stage user flow analysis</p>
        </div>
      </div>

      <div className="space-y-4">
        {funnel?.map((stage, index) => {
          const widthPercent = (stage.users / maxUsers) * 100;
          const conversionRate = index === 0 ? 100 : (stage.users / funnel[0].users) * 100;
          const dropOffRate = index > 0 ? ((funnel[index - 1].users - stage.users) / funnel[index - 1].users) * 100 : 0;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{stage.name}</span>
                  {dropOffRate > 30 && index > 0 && (
                    <AlertCircle className="w-4 h-4 text-red-400" title={`High drop-off: ${dropOffRate.toFixed(1)}%`} />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">{stage.users.toLocaleString()} users</span>
                  <span className="text-xs font-semibold text-cyan-400">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative h-16 bg-white/5 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.15 + 0.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className={`h-full rounded-lg ${
                    conversionRate >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    conversionRate >= 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                    conversionRate >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                    'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm font-bold text-white">{stage.users.toLocaleString()}</span>
                  </div>
                </motion.div>
              </div>

              {/* Drop-off Indicator */}
              {index > 0 && dropOffRate > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                  className="absolute -top-1 right-0 flex items-center gap-1 text-xs text-red-400"
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>{dropOffRate.toFixed(1)}% drop</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall Conversion */}
      {funnel && funnel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: funnel.length * 0.15 + 0.3 }}
          className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Overall Conversion Rate</span>
            <span className="text-xl font-bold text-cyan-400">
              {((funnel[funnel.length - 1].users / funnel[0].users) * 100).toFixed(2)}%
            </span>
          </div>
        </motion.div>
      )}
    </CinematicCard>
  );
}