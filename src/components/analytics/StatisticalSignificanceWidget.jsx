/**
 * Statistical Significance Widget — p-value and confidence interval display
 * Calculates and visualizes statistical confidence in A/B test results
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { BarChart, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function StatisticalSignificanceWidget({ testId, variantA, variantB }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistical-significance', testId, variantA, variantB],
    queryFn: async () => {
      const result = await base44.functions.invoke('calculateStatisticalSignificance', {
        test_id: testId,
        variant_a: variantA,
        variant_b: variantB
      });
      return result.data || {};
    },
    enabled: !!testId && !!variantA && !!variantB,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <CinematicCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-32 bg-white/10 rounded" />
        </div>
      </CinematicCard>
    );
  }

  const isSignificant = stats?.p_value < 0.05;
  const confidencePercent = stats?.confidence_interval ? (1 - stats.p_value) * 100 : 0;

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <BarChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Statistical Significance</h3>
          <p className="text-sm text-white/60">Confidence analysis for test results</p>
        </div>
      </div>

      {/* Significance Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`p-4 rounded-lg mb-6 ${
          isSignificant
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
            : 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {isSignificant ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          )}
          <span className="text-lg font-bold text-white">
            {isSignificant ? 'Statistically Significant' : 'Not Yet Significant'}
          </span>
        </div>
        <p className="text-sm text-white/70">
          {isSignificant
            ? 'Results are reliable with high confidence. Safe to make decisions.'
            : 'Continue testing to reach statistical significance (p < 0.05).'}
        </p>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-white/60">p-value</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.p_value?.toFixed(4) || '—'}
          </p>
          <Badge className={`mt-2 ${
            stats?.p_value < 0.01 ? 'bg-green-500/20 text-green-300' :
            stats?.p_value < 0.05 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {stats?.p_value < 0.01 ? 'Highly Significant' :
             stats?.p_value < 0.05 ? 'Significant' :
             'Not Significant'}
          </Badge>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/60">Confidence Level</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {confidencePercent.toFixed(1)}%
          </p>
          <Badge className="mt-2 bg-purple-500/20 text-purple-300">
            {confidencePercent >= 95 ? 'High' : confidencePercent >= 90 ? 'Moderate' : 'Low'}
          </Badge>
        </div>
      </div>

      {/* Confidence Interval */}
      {stats?.confidence_interval && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <h4 className="text-sm font-semibold text-white/80 mb-3">95% Confidence Interval</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-white/60">Lower Bound:</span>
            <span className="text-sm font-medium text-white">{stats.confidence_interval.lower.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-white/60">Upper Bound:</span>
            <span className="text-sm font-medium text-white">{stats.confidence_interval.upper.toFixed(4)}</span>
          </div>
          
          {/* Visual CI Bar */}
          <div className="mt-4 relative h-8 bg-white/5 rounded-lg overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40"
              style={{
                left: `${Math.max(0, stats.confidence_interval.lower * 100)}%`,
                width: `${Math.min(100, (stats.confidence_interval.upper - stats.confidence_interval.lower) * 100)}%`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                [{stats.confidence_interval.lower.toFixed(3)}, {stats.confidence_interval.upper.toFixed(3)}]
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Effect Size */}
      {stats?.effect_size !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Effect Size (Cohen's d)</span>
            <span className="text-lg font-bold text-white">{stats.effect_size.toFixed(3)}</span>
          </div>
          <div className="mt-2 text-xs text-white/60">
            {Math.abs(stats.effect_size) < 0.2 ? 'Small effect' :
             Math.abs(stats.effect_size) < 0.5 ? 'Medium effect' :
             'Large effect'}
          </div>
        </motion.div>
      )}
    </CinematicCard>
  );
}