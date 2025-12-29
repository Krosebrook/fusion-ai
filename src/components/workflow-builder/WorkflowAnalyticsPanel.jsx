/**
 * Workflow Analytics Panel
 * Display AI-powered insights from execution logs
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { workflowAnalyticsService } from '../services/WorkflowAnalyticsService';
import { toast } from 'sonner';

export function WorkflowAnalyticsPanel({ workflow, onClose, onApplyFix }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [applyingFix, setApplyingFix] = useState(null);

  useEffect(() => {
    analyzeWorkflow();
  }, [workflow.id]);

  const analyzeWorkflow = async () => {
    setLoading(true);
    try {
      const result = await workflowAnalyticsService.analyzeExecutionLogs(workflow.id);
      
      if (result.status === 'no_data') {
        setAnalytics({ status: 'no_data' });
      } else {
        setAnalytics(result.analysis);
      }
    } catch (error) {
      console.error('Analytics failed', error);
      toast.error('Failed to analyze workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = async (optimization) => {
    setApplyingFix(optimization.title);
    try {
      await workflowAnalyticsService.applyAutoFix(workflow.id, optimization);
      toast.success(`✅ ${optimization.title} applied`);
      onApplyFix?.();
    } catch (error) {
      console.error('Failed to apply fix', error);
      toast.error('Failed to apply optimization');
    } finally {
      setApplyingFix(null);
    }
  };

  const getHealthColor = (status) => {
    const colors = {
      excellent: 'from-green-500 to-emerald-600',
      good: 'from-blue-500 to-cyan-600',
      fair: 'from-yellow-500 to-orange-600',
      poor: 'from-orange-500 to-red-600',
      critical: 'from-red-600 to-red-700',
    };
    return colors[status] || colors.fair;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Analyzing execution logs...</p>
        </div>
      </div>
    );
  }

  if (analytics?.status === 'no_data') {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <CinematicCard className="max-w-md p-8 text-center">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Execution History</h3>
          <p className="text-white/60 mb-6">Run this workflow at least once to see analytics</p>
          <CinematicButton variant="primary" onClick={onClose}>
            Close
          </CinematicButton>
        </CinematicCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Workflow Analytics</h2>
                <p className="text-white/60 text-sm">AI-powered insights & predictions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Health Score */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/60 text-sm mb-1">Overall Health</div>
                <div className="text-3xl font-bold text-white">{analytics.overall_score}/100</div>
              </div>
              <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getHealthColor(analytics.health_status)} text-white font-semibold`}>
                {analytics.health_status.toUpperCase()}
              </div>
            </div>
          </CinematicCard>

          {/* Predictions */}
          {analytics.predictions && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Predictive Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-white/60 text-sm mb-1">Next Duration</div>
                  <div className="text-xl font-bold text-white">
                    {(analytics.predictions.next_execution_duration_ms / 1000).toFixed(1)}s
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-white/60 text-sm mb-1">Failure Risk</div>
                  <div className="text-xl font-bold text-white">
                    {(analytics.predictions.failure_probability * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-white/60 text-sm mb-1">Confidence</div>
                  <div className="text-xl font-bold text-white capitalize">
                    {analytics.predictions.confidence}
                  </div>
                </div>
              </div>
            </CinematicCard>
          )}

          {/* Bottlenecks */}
          {analytics.bottlenecks?.length > 0 && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Performance Bottlenecks</h3>
              </div>
              <div className="space-y-3">
                {analytics.bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-white font-semibold">{bottleneck.node_id}</div>
                        <div className="text-white/60 text-sm">{bottleneck.node_type}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        bottleneck.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        bottleneck.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {bottleneck.impact.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-white/70 mb-2">
                      <span>Avg: {bottleneck.avg_duration_ms}ms</span>
                      <span>P95: {bottleneck.percentile_95_ms}ms</span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{bottleneck.description}</p>
                    <p className="text-cyan-400 text-sm">💡 {bottleneck.recommendation}</p>
                  </div>
                ))}
              </div>
            </CinematicCard>
          )}

          {/* Failure Patterns */}
          {analytics.failure_patterns?.length > 0 && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Failure Patterns</h3>
              </div>
              <div className="space-y-3">
                {analytics.failure_patterns.map((pattern, i) => (
                  <div key={i} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="text-white font-semibold mb-2">{pattern.node_id}</div>
                    <div className="text-red-400 text-sm mb-2">
                      Failure Rate: {(pattern.failure_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-white/70 text-sm mb-2">
                      <strong>Root Cause:</strong> {pattern.root_cause}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      <strong>Mitigation:</strong> {pattern.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </CinematicCard>
          )}

          {/* Optimizations */}
          {analytics.optimizations?.length > 0 && (
            <CinematicCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Optimization Opportunities</h3>
              </div>
              <div className="space-y-3">
                {analytics.optimizations.map((opt, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{opt.title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            opt.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            opt.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {opt.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm mb-2">{opt.description}</p>
                        <div className="text-green-400 text-sm">
                          ⚡ {opt.estimated_improvement} improvement
                        </div>
                      </div>
                      {opt.auto_fixable && (
                        <CinematicButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleApplyFix(opt)}
                          disabled={applyingFix !== null}
                        >
                          {applyingFix === opt.title ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Auto-Fix'
                          )}
                        </CinematicButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CinematicCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default WorkflowAnalyticsPanel;