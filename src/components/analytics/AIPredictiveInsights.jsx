import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Zap, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

export default function AIPredictiveInsights({ runs, configs, analytics }) {
  const [insights, setInsights] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const analysisData = {
        totalRuns: analytics.total,
        successRate: analytics.successRate,
        avgDuration: analytics.avgDuration,
        topFailures: analytics.topFailures,
        trendData: analytics.trendData.slice(-14),
        branchPerformance: analytics.branchPerformance.slice(0, 5),
        configCount: configs.length
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert DevOps engineer analyzing CI/CD pipeline data. Generate insights and predictions.

PIPELINE DATA:
- Total Runs: ${analysisData.totalRuns}
- Success Rate: ${analysisData.successRate}%
- Average Duration: ${Math.floor(analysisData.avgDuration / 60)}m ${analysisData.avgDuration % 60}s
- Active Pipelines: ${analysisData.configCount}

RECENT TRENDS (last 14 days):
${JSON.stringify(analysisData.trendData, null, 2)}

TOP FAILURE REASONS:
${JSON.stringify(analysisData.topFailures, null, 2)}

BRANCH PERFORMANCE:
${JSON.stringify(analysisData.branchPerformance, null, 2)}

Generate:
1. 3 predictive insights about potential future issues
2. 3 optimization recommendations with estimated impact
3. Overall health score (0-100) with reasoning
4. Predicted success rate for next week
5. Risk factors to monitor

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            health_reasoning: { type: "string" },
            predicted_success_rate: { type: "number" },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  probability: { type: "string" },
                  severity: { type: "string" },
                  prevention: { type: "string" }
                }
              }
            },
            optimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  time_saved: { type: "string" }
                }
              }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => setInsights(data)
  });

  const getHealthColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const severityColors = {
    low: '#00B4D8',
    medium: '#F59E0B',
    high: '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-purple-500/30 p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)" }}
        >
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Pipeline Intelligence</h3>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Let our AI analyze your pipeline data to predict potential issues, 
            recommend optimizations, and provide actionable insights.
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Pipeline Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Insights Dashboard */}
      {insights && (
        <>
          {/* Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-white/10 p-6 col-span-1"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Pipeline Health Score
              </h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke={getHealthColor(insights.health_score)}
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${insights.health_score * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{insights.health_score}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 text-center">{insights.health_reasoning}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Predicted Success Rate
              </h3>
              <p className="text-5xl font-bold text-green-400 mb-2">{insights.predicted_success_rate}%</p>
              <p className="text-sm text-gray-400">Expected for next week based on current trends</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {insights.risk_factors?.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-400 mt-1">⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Predictive Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.predictions?.map((prediction, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{
                    background: `${severityColors[prediction.severity?.toLowerCase()]}10`,
                    borderColor: `${severityColors[prediction.severity?.toLowerCase()]}30`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: severityColors[prediction.severity?.toLowerCase()] }} />
                    <span className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ 
                            background: `${severityColors[prediction.severity?.toLowerCase()]}20`,
                            color: severityColors[prediction.severity?.toLowerCase()]
                          }}>
                      {prediction.probability} probability
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{prediction.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{prediction.description}</p>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-green-400">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Prevention: {prediction.prevention}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Optimizations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/10 p-6"
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Optimization Recommendations
            </h3>
            <div className="space-y-4">
              {insights.optimizations?.map((opt, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{opt.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{opt.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {opt.time_saved}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                      Impact: {opt.impact}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      Effort: {opt.effort}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Regenerate */}
          <div className="text-center">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              variant="outline"
              className="border-purple-500/30 text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              Regenerate Insights
            </Button>
          </div>
        </>
      )}
    </div>
  );
}