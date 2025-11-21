import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Clock, Target, Zap, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OptimizationReport({ pipelineId, optimizations }) {
  const { data: runsBeforeOpt = [] } = useQuery({
    queryKey: ['runsBeforeOpt', pipelineId],
    queryFn: async () => {
      const oldestOpt = optimizations.reduce((min, opt) => 
        !min || new Date(opt.applied_at) < new Date(min.applied_at) ? opt : min
      , null);
      
      if (!oldestOpt) return [];

      const runs = await base44.entities.PipelineRun.filter({
        pipeline_config_id: pipelineId
      });

      return runs.filter(r => new Date(r.created_date) < new Date(oldestOpt.applied_at));
    },
    enabled: optimizations.length > 0
  });

  const { data: runsAfterOpt = [] } = useQuery({
    queryKey: ['runsAfterOpt', pipelineId],
    queryFn: async () => {
      const oldestOpt = optimizations.reduce((min, opt) => 
        !min || new Date(opt.applied_at) < new Date(min.applied_at) ? opt : min
      , null);
      
      if (!oldestOpt) return [];

      const runs = await base44.entities.PipelineRun.filter({
        pipeline_config_id: pipelineId
      });

      return runs.filter(r => new Date(r.created_date) >= new Date(oldestOpt.applied_at));
    },
    enabled: optimizations.length > 0
  });

  // Calculate metrics
  const avgDurationBefore = runsBeforeOpt.length > 0
    ? runsBeforeOpt.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / runsBeforeOpt.length / 60
    : 0;

  const avgDurationAfter = runsAfterOpt.length > 0
    ? runsAfterOpt.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / runsAfterOpt.length / 60
    : 0;

  const successRateBefore = runsBeforeOpt.length > 0
    ? (runsBeforeOpt.filter(r => r.status === 'success').length / runsBeforeOpt.length) * 100
    : 0;

  const successRateAfter = runsAfterOpt.length > 0
    ? (runsAfterOpt.filter(r => r.status === 'success').length / runsAfterOpt.length) * 100
    : 0;

  const timeSaved = avgDurationBefore - avgDurationAfter;
  const successRateChange = successRateAfter - successRateBefore;
  const totalTimeSaved = timeSaved * runsAfterOpt.length;
  const costReduction = totalTimeSaved * 0.5; // Assume $0.50/minute

  // Prepare chart data
  const allRuns = [...runsBeforeOpt, ...runsAfterOpt]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-20);

  const chartData = allRuns.map(run => ({
    date: new Date(run.created_date).toLocaleDateString(),
    duration: (run.duration_seconds || 0) / 60,
    success: run.status === 'success' ? 1 : 0
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Optimization Impact Report
        </h2>
        <p className="text-sm text-gray-400 mt-1">Real-world performance improvements</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              {timeSaved > 0 ? (
                <TrendingDown className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">{Math.abs(timeSaved).toFixed(1)}m</p>
            <p className="text-xs text-gray-400">Avg Time {timeSaved > 0 ? 'Saved' : 'Added'}</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              {successRateChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">{successRateChange > 0 ? '+' : ''}{successRateChange.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Success Rate Change</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(totalTimeSaved)}m</p>
            <p className="text-xs text-gray-400">Total Time Saved</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">${costReduction.toFixed(0)}</p>
            <p className="text-xs text-gray-400">Cost Reduction</p>
          </div>
        </div>

        {/* Duration Trend */}
        <div className="p-4 rounded-xl bg-black/20 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Duration Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="text-sm font-semibold text-white mb-3">Before Optimization</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Avg Duration:</span>
                <span className="text-sm font-semibold text-white">{avgDurationBefore.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Success Rate:</span>
                <span className="text-sm font-semibold text-white">{successRateBefore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Total Runs:</span>
                <span className="text-sm font-semibold text-white">{runsBeforeOpt.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <h4 className="text-sm font-semibold text-white mb-3">After Optimization</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Avg Duration:</span>
                <span className="text-sm font-semibold text-green-400">{avgDurationAfter.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Success Rate:</span>
                <span className="text-sm font-semibold text-green-400">{successRateAfter.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Total Runs:</span>
                <span className="text-sm font-semibold text-white">{runsAfterOpt.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applied Optimizations Summary */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">Applied Optimizations</h3>
          <div className="space-y-2">
            {optimizations.map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/20">
                <span className="text-sm text-white">{opt.title}</span>
                <span className="text-xs text-gray-400">
                  {new Date(opt.applied_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}