/**
 * Pipeline Intelligence Dashboard
 * AI-powered build failure prediction and optimization
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { AlertTriangle, Zap, TrendingDown, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function PipelineIntelligence() {
  const [selectedMetric, setSelectedMetric] = useState('failures');

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => base44.entities.PipelineConfig.list('-created_date', 10),
  });

  const { data: predictions = null, isPending: isPredicting } = useQuery({
    queryKey: ['pipeline-predictions'],
    queryFn: async () => {
      const result = await base44.functions.invoke('predictBuildFailures', {
        pipelineIds: pipelines.map(p => p.id),
      });
      return result;
    },
    enabled: pipelines.length > 0,
  });

  const failureTrendData = [
    { week: 'Week 1', failureRate: 12, predicted: 12 },
    { week: 'Week 2', failureRate: 8, predicted: 8 },
    { week: 'Week 3', failureRate: 15, predicted: 14 },
    { week: 'Week 4', failureRate: 9, predicted: 13 },
    { week: 'Week 5', failureRate: null, predicted: 11 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pipeline Intelligence</h2>
            <p className="text-white/60 text-sm">AI-powered build optimization & failure prediction</p>
          </div>
        </div>
      </motion.div>

      {/* Prediction Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <CinematicCard className="p-6">
          <p className="text-white/60 text-sm mb-2">Predicted Failures (7d)</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent mb-2"
          >
            {predictions?.predicted7DayFailures || '-'}
          </motion.p>
          <p className="text-red-400/70 text-xs">
            Current trend: {predictions?.trendDirection}
          </p>
        </CinematicCard>

        <CinematicCard className="p-6">
          <p className="text-white/60 text-sm mb-2">Build Performance</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-cyan-400 mb-2"
          >
            {predictions?.avgBuildTime || '-'}s
          </motion.p>
          <p className="text-cyan-400/70 text-xs">
            {predictions?.buildTimeImprovement} better than baseline
          </p>
        </CinematicCard>

        <CinematicCard className="p-6">
          <p className="text-white/60 text-sm mb-2">Code Quality Issues</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-purple-400 mb-2"
          >
            {predictions?.qualityBottlenecks || '-'}
          </motion.p>
          <p className="text-purple-400/70 text-xs">
            Detected in pipeline analysis
          </p>
        </CinematicCard>
      </motion.div>

      {/* Failure Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Build Failure Trend
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={failureTrendData}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
                formatter={(value) => value ? `${value}%` : '-'}
              />
              <Line
                type="monotone"
                dataKey="failureRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="Actual"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#06b6d4"
                strokeDasharray="5"
                name="Predicted"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CinematicCard>
      </motion.div>

      {/* Recommendations */}
      <AnimatePresence>
        {predictions?.recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CinematicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                AI Recommendations
              </h3>

              <div className="space-y-3">
                {predictions.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{rec.action}</p>
                        <p className="text-white/70 text-sm mt-1">{rec.reasoning}</p>
                        {rec.expectedImprovement && (
                          <p className="text-green-400 text-xs font-bold mt-2">
                            Expected improvement: {rec.expectedImprovement}%
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CinematicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}