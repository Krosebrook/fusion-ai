import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Zap, Server, GitBranch, TrendingDown, ChevronRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Treemap
} from "recharts";

export default function BottleneckAnalyzer({ runs, configs }) {
  const navigate = useNavigate();
  const [expandedBottleneck, setExpandedBottleneck] = useState(null);

  const bottlenecks = useMemo(() => {
    const issues = [];

    // 1. Slow steps analysis
    const stepDurations = {};
    runs.forEach(run => {
      run.steps?.forEach(step => {
        if (!stepDurations[step.name]) {
          stepDurations[step.name] = { durations: [], failures: 0 };
        }
        if (step.started_at && step.completed_at) {
          const duration = (new Date(step.completed_at) - new Date(step.started_at)) / 1000;
          stepDurations[step.name].durations.push(duration);
        }
        if (step.status === 'failed') {
          stepDurations[step.name].failures++;
        }
      });
    });

    const slowSteps = Object.entries(stepDurations)
      .map(([name, data]) => ({
        name,
        avgDuration: data.durations.length > 0 
          ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
          : 0,
        failureRate: runs.length > 0 ? (data.failures / runs.length * 100).toFixed(1) : 0
      }))
      .filter(s => s.avgDuration > 60)
      .sort((a, b) => b.avgDuration - a.avgDuration);

    if (slowSteps.length > 0) {
      issues.push({
        type: 'slow_steps',
        severity: 'high',
        title: 'Slow Build Steps Detected',
        description: `${slowSteps.length} steps take over 1 minute on average`,
        impact: `~${Math.round(slowSteps.reduce((sum, s) => sum + s.avgDuration, 0) / 60)}m potential time savings`,
        data: slowSteps,
        recommendations: [
          'Enable step caching for dependencies',
          'Parallelize independent steps',
          'Use incremental builds where possible',
          'Consider splitting into smaller jobs'
        ]
      });
    }

    // 2. Peak hour congestion
    const hourlyBuilds = Array(24).fill(0);
    runs.forEach(run => {
      const hour = new Date(run.created_date).getHours();
      hourlyBuilds[hour]++;
    });
    const peakHour = hourlyBuilds.indexOf(Math.max(...hourlyBuilds));
    const peakCount = hourlyBuilds[peakHour];
    
    if (peakCount > runs.length * 0.2) {
      issues.push({
        type: 'congestion',
        severity: 'medium',
        title: 'Build Queue Congestion',
        description: `${peakCount} builds (${Math.round(peakCount / runs.length * 100)}%) run at ${peakHour}:00`,
        impact: 'Queue delays during peak hours',
        data: hourlyBuilds.map((count, hour) => ({ hour: `${hour}:00`, count })),
        recommendations: [
          'Stagger scheduled builds',
          'Increase concurrent job limits',
          'Use build prioritization',
          'Consider off-peak scheduling for non-critical builds'
        ]
      });
    }

    // 3. Flaky tests detection
    const flakyRuns = runs.filter((run, idx) => {
      const prev = runs[idx + 1];
      return prev && run.branch === prev.branch && run.status !== prev.status;
    });

    if (flakyRuns.length > runs.length * 0.1) {
      issues.push({
        type: 'flaky',
        severity: 'high',
        title: 'Flaky Test Patterns Detected',
        description: `${flakyRuns.length} runs show inconsistent results`,
        impact: 'Reduced confidence in CI, wasted retries',
        data: { flakyCount: flakyRuns.length, total: runs.length },
        recommendations: [
          'Identify and quarantine flaky tests',
          'Add retry logic for network-dependent tests',
          'Review test isolation',
          'Implement test stability metrics'
        ]
      });
    }

    // 4. Missing optimizations
    configs.forEach(config => {
      if (!config.quality_gates?.enabled) {
        issues.push({
          type: 'missing_quality',
          severity: 'low',
          title: `Quality Gates Disabled: ${config.name}`,
          description: 'No automated quality checks configured',
          impact: 'Potential code quality issues reaching production',
          data: { pipeline: config.name },
          recommendations: [
            'Enable ESLint for code quality',
            'Add Snyk for security scanning',
            'Configure coverage thresholds',
            'Implement SonarQube analysis'
          ]
        });
      }
    });

    // 5. Long-running pipelines
    const avgDuration = runs.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / runs.length;
    if (avgDuration > 600) {
      issues.push({
        type: 'long_duration',
        severity: 'high',
        title: 'Excessive Build Times',
        description: `Average build time: ${Math.round(avgDuration / 60)} minutes`,
        impact: 'Reduced developer productivity, longer feedback loops',
        data: { avgDuration },
        recommendations: [
          'Implement build caching',
          'Use smaller base images',
          'Parallelize test suites',
          'Consider monorepo build optimization'
        ]
      });
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [runs, configs]);

  const severityColors = {
    critical: { bg: '#EF4444', light: 'rgba(239, 68, 68, 0.1)' },
    high: { bg: '#F59E0B', light: 'rgba(245, 158, 11, 0.1)' },
    medium: { bg: '#8B5CF6', light: 'rgba(139, 92, 246, 0.1)' },
    low: { bg: '#00B4D8', light: 'rgba(0, 180, 216, 0.1)' }
  };

  const typeIcons = {
    slow_steps: Clock,
    congestion: Server,
    flaky: AlertTriangle,
    missing_quality: Zap,
    long_duration: TrendingDown
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map(severity => {
          const count = bottlenecks.filter(b => b.severity === severity).length;
          return (
            <motion.div
              key={severity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border p-4"
              style={{
                background: severityColors[severity].light,
                borderColor: `${severityColors[severity].bg}30`
              }}
            >
              <p className="text-2xl font-bold" style={{ color: severityColors[severity].bg }}>{count}</p>
              <p className="text-sm text-gray-400 capitalize">{severity} Issues</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottleneck List */}
      <div className="space-y-4">
        {bottlenecks.map((bottleneck, idx) => {
          const Icon = typeIcons[bottleneck.type] || AlertTriangle;
          const colors = severityColors[bottleneck.severity];
          const isExpanded = expandedBottleneck === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border overflow-hidden cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                borderColor: `${colors.bg}30`
              }}
              onClick={() => setExpandedBottleneck(isExpanded ? null : idx)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ background: colors.light }}>
                      <Icon className="w-5 h-5" style={{ color: colors.bg }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{bottleneck.title}</h4>
                        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                              style={{ background: colors.light, color: colors.bg }}>
                          {bottleneck.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{bottleneck.description}</p>
                      <p className="text-xs text-purple-400 mt-1">Impact: {bottleneck.impact}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-green-400" />
                      Recommendations
                    </h5>
                    <ul className="space-y-2 mb-4">
                      {bottleneck.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-green-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>

                    {bottleneck.type === 'slow_steps' && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h6 className="text-xs text-gray-400 mb-2">Slowest Steps</h6>
                        {bottleneck.data.slice(0, 5).map((step, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                            <span className="text-sm text-white">{step.name}</span>
                            <span className="text-xs text-orange-400">{Math.floor(step.avgDuration / 60)}m {step.avgDuration % 60}s avg</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {bottleneck.type === 'congestion' && (
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={bottleneck.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} />
                            <YAxis stroke="#94A3B8" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#1E293B', border: 'none' }} />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(createPageUrl("PipelineOptimization"));
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-Fix with AI
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {bottlenecks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl border border-green-500/20 bg-green-500/5"
          >
            <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bottlenecks Detected</h3>
            <p className="text-gray-400">Your pipelines are running optimally!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}