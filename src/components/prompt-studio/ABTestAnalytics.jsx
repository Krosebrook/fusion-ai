/**
 * A/B Test Analytics - Statistical significance and detailed analysis
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { 
  Award, TrendingUp, BarChart3, AlertCircle, 
  CheckCircle, Clock 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export function ABTestAnalytics() {
  const [selectedTest, setSelectedTest] = useState(null);

  const { data: experiments = [] } = useQuery({
    queryKey: ['prompt-experiments'],
    queryFn: () => base44.entities.PromptExperiment?.list?.('-created_at', 50) || []
  });

  const completedTests = experiments.filter(e => e.status === 'completed' || e.results);

  const calculateConfidenceInterval = (data) => {
    if (!data?.length) return { lower: 0, upper: 0 };
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length
    );
    const ci = 1.96 * (stdDev / Math.sqrt(data.length));
    return { lower: (mean - ci).toFixed(2), upper: (mean + ci).toFixed(2) };
  };

  return (
    <div className="space-y-6">
      {/* Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Tests', value: experiments.length, icon: BarChart3 },
          { label: 'Completed', value: completedTests.length, icon: CheckCircle },
          { label: 'Winners Found', value: experiments.filter(e => e.results?.winner_variant_id).length, icon: Award }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className="w-5 h-5 text-blue-400" />
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Tests</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {experiments.map((exp) => (
              <motion.button
                key={exp.id}
                onClick={() => setSelectedTest(exp)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedTest?.id === exp.id
                    ? 'bg-blue-600/30 border border-blue-500'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-sm text-white font-semibold truncate">{exp.name}</p>
                <Badge className="mt-2 text-xs" variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                  {exp.status}
                </Badge>
              </motion.button>
            ))}
          </div>
        </CinematicCard>

        {/* Test Details */}
        {selectedTest && (
          <CinematicCard className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedTest.name}</h2>
              {selectedTest.hypothesis && (
                <p className="text-white/60 text-sm">
                  <span className="text-white/80 font-semibold">Hypothesis:</span> {selectedTest.hypothesis}
                </p>
              )}
            </div>

            {selectedTest.results && (
              <div className="space-y-6">
                {/* Winner Display */}
                {selectedTest.results.is_significant && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-bold">Winner Found</p>
                        <p className="text-white/60 text-sm">{selectedTest.results.winner_variant_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/60">Confidence</p>
                        <p className="text-green-300 font-bold">{selectedTest.results.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-white/60">Lift</p>
                        <p className="text-green-300 font-bold">{selectedTest.results.lift_percentage}%</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!selectedTest.results.is_significant && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <p className="text-yellow-300">No significant difference detected</p>
                    </div>
                    <p className="text-white/60 text-xs mt-2">p-value: {selectedTest.results.p_value?.toFixed(4)}</p>
                  </motion.div>
                )}

                {/* Variant Metrics */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Variant Performance</h3>
                  {selectedTest.results.variant_metrics && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={selectedTest.results.variant_metrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="variant_id" stroke="#ffffff40" />
                        <YAxis stroke="#ffffff40" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="avg_quality_score" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Detailed Stats */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTest.results.variant_metrics?.map((variant, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <p className="text-white/60 text-xs mb-2">{variant.variant_id}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-white">Executions: {variant.executions}</p>
                          <p className="text-white/80">Latency: {variant.avg_latency_ms}ms</p>
                          <p className="text-white/80">Success: {variant.success_rate?.toFixed(1)}%</p>
                          {variant.confidence_interval && (
                            <p className="text-white/60 text-xs">
                              CI: [{variant.confidence_interval.lower}, {variant.confidence_interval.upper}]
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CinematicCard>
        )}
      </div>
    </div>
  );
}