import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, TrendingUp, Zap, Clock, Target, CheckCircle2,
  XCircle, Loader2, ChevronDown, Code, BarChart3, Share2,
  AlertTriangle, TrendingDown
} from "lucide-react";
import ShareDialog from "../collaboration/ShareDialog";

const optimizationIcons = {
  parallelization: Zap,
  resource_allocation: Target,
  build_optimization: TrendingUp,
  caching: Clock,
  dependency_optimization: Code
};

const optimizationColors = {
  parallelization: { bg: "#8B5CF6", light: "rgba(139, 92, 246, 0.1)" },
  resource_allocation: { bg: "#3B82F6", light: "rgba(59, 130, 246, 0.1)" },
  build_optimization: { bg: "#10B981", light: "rgba(16, 185, 129, 0.1)" },
  caching: { bg: "#F59E0B", light: "rgba(245, 158, 11, 0.1)" },
  dependency_optimization: { bg: "#EC4899", light: "rgba(236, 72, 153, 0.1)" }
};

export default function OptimizationDashboard({ pipelineId, onOptimizationApplied }) {
  const queryClient = useQueryClient();
  const [expandedOpt, setExpandedOpt] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizations, setOptimizations] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [shareOpt, setShareOpt] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const result = await base44.functions.invoke('analyzePipeline', {
        pipeline_config_id: pipelineId
      });
      return result;
    },
    onSuccess: (data) => {
      setOptimizations(data.optimizations);
      setBottlenecks(data.bottlenecks || []);
      setSummary(data.analysis_summary);
      setAnalyzing(false);
    },
    onError: () => {
      setAnalyzing(false);
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (optimizationId) => {
      return base44.functions.invoke('applyOptimization', {
        optimization_id: optimizationId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['optimizations']);
      if (onOptimizationApplied) onOptimizationApplied();
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (optimizationId) => {
      return base44.entities.PipelineOptimization.update(optimizationId, {
        status: 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['optimizations']);
    }
  });

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-purple-500/30 p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          AI Pipeline Optimizer
        </h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Analyze your pipeline's performance and get intelligent optimization recommendations
          powered by advanced machine learning algorithms
        </p>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 text-lg"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Performance...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Run AI Analysis
            </>
          )}
        </Button>
      </motion.div>

      {/* Bottleneck Predictions */}
      {bottlenecks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-500/30 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
            backdropFilter: "blur(20px)"
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Predicted Bottlenecks
                </h3>
                <p className="text-sm text-gray-400">Issues detected before they impact your pipeline</p>
              </div>
            </div>

            <div className="space-y-3">
              {bottlenecks.map((bottleneck, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl border border-white/10 bg-white/5"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: bottleneck.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                                       bottleneck.severity === 'medium' ? 'rgba(251, 146, 60, 0.2)' :
                                       'rgba(234, 179, 8, 0.2)'
                      }}
                    >
                      <TrendingDown
                        className="w-5 h-5"
                        style={{
                          color: bottleneck.severity === 'high' ? '#EF4444' :
                                bottleneck.severity === 'medium' ? '#FB923C' :
                                '#EAB308'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white capitalize">
                          {bottleneck.type.replace(/_/g, ' ')}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: bottleneck.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                                           bottleneck.severity === 'medium' ? 'rgba(251, 146, 60, 0.2)' :
                                           'rgba(234, 179, 8, 0.2)',
                            color: bottleneck.severity === 'high' ? '#EF4444' :
                                  bottleneck.severity === 'medium' ? '#FB923C' :
                                  '#EAB308'
                          }}
                        >
                          {bottleneck.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{bottleneck.description}</p>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 mb-2">
                        <p className="text-xs text-blue-400">
                          <strong>Prediction:</strong> {bottleneck.prediction}
                        </p>
                      </div>
                      <p className="text-xs text-green-400">
                        <strong>Fix:</strong> {bottleneck.recommendation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-sm text-gray-400">Total Runs</p>
            <p className="text-3xl font-bold text-white">{summary.total_runs}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <Clock className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-sm text-gray-400">Avg Duration</p>
            <p className="text-3xl font-bold text-white">{summary.avg_duration_minutes}m</p>
          </div>
          <div className="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <Target className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-sm text-gray-400">Success Rate</p>
            <p className="text-3xl font-bold text-white">{summary.success_rate}%</p>
          </div>
          <div className="rounded-xl border border-white/10 p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-3" />
            <p className="text-sm text-gray-400">Potential Savings</p>
            <p className="text-3xl font-bold text-white">{Math.round(summary.potential_time_saved)}m</p>
          </div>
        </motion.div>
      )}

      {/* Optimizations List */}
      {optimizations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Recommendations
          </h3>

          {optimizations.map((opt, idx) => {
            const Icon = optimizationIcons[opt.optimization_type] || Sparkles;
            const colors = optimizationColors[opt.optimization_type] || optimizationColors.build_optimization;
            const isExpanded = expandedOpt === opt.id;

            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                  backdropFilter: "blur(20px)"
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.light }}
                      >
                        <Icon className="w-7 h-7" style={{ color: colors.bg }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">{opt.title}</h4>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: opt.confidence_score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: opt.confidence_score >= 80 ? '#10B981' : '#F59E0B'
                            }}
                          >
                            {opt.confidence_score}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">{opt.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Comparison */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-gray-400 mb-2">Current Performance</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white font-semibold">{Math.round(opt.current_metrics?.avg_duration / 60)}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Success Rate:</span>
                          <span className="text-white font-semibold">{opt.current_metrics?.success_rate?.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-gray-400 mb-2">Projected Performance</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-green-400 font-semibold">{Math.round(opt.projected_metrics?.avg_duration / 60)}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Success Rate:</span>
                          <span className="text-green-400 font-semibold">{opt.projected_metrics?.success_rate?.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-green-500/20">
                          <span className="text-gray-400">Time Saved:</span>
                          <span className="text-green-400 font-bold">{Math.round(opt.projected_metrics?.time_saved)}m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() => setExpandedOpt(isExpanded ? null : opt.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
                  >
                    <span className="text-sm font-semibold">Implementation Details</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 mt-3 rounded-lg bg-black/20 border border-white/10">
                          <h5 className="text-sm font-semibold text-white mb-3">Steps to Apply:</h5>
                          <ol className="space-y-2">
                            {opt.implementation_steps?.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  {opt.status === 'pending' && (
                    <div className="space-y-3 mt-4">
                      <div className="flex gap-3">
                        <Button
                          onClick={() => applyMutation.mutate(opt.id)}
                          disabled={applyMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                          {applyMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Auto-Apply Optimization
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate(opt.id)}
                          variant="outline"
                          className="border-red-500/30 text-red-400"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                      <Button
                        onClick={() => setShareOpt(opt)}
                        variant="outline"
                        className="w-full border-blue-500/30 text-blue-400"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Recommendation
                      </Button>
                    </div>
                  )}

                  {opt.status === 'applied' && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Applied on {new Date(opt.applied_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {shareOpt && (
        <ShareDialog
          title={shareOpt.title}
          data={{
            optimization_type: shareOpt.optimization_type,
            title: shareOpt.title,
            description: shareOpt.description,
            current_metrics: shareOpt.current_metrics,
            projected_metrics: shareOpt.projected_metrics,
            implementation_steps: shareOpt.implementation_steps,
            confidence_score: shareOpt.confidence_score
          }}
          type="optimization"
          onClose={() => setShareOpt(null)}
        />
      )}
    </div>
  );
}