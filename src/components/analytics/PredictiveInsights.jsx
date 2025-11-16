import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { TrendingUp, AlertTriangle, Target, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function PredictiveInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following metrics and provide predictive insights:
        - Current Users: 12,458 (up 12.5% from last week)
        - Active Sessions: 3,247 (up 8.3%)
        - Page Views: 48,200 (down 2.4%)
        - Avg Duration: 4m 32s (up 15.8%)
        
        Provide:
        1. Projected growth for next month
        2. Potential bottlenecks or risks
        3. Actionable recommendations
        4. Confidence level (0-100)`,
        response_json_schema: {
          type: "object",
          properties: {
            projected_growth: {
              type: "object",
              properties: {
                users: { type: "string" },
                sessions: { type: "string" },
                confidence: { type: "number" }
              }
            },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setInsights(result);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  if (loading || !insights) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">AI analyzing your data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Predictive Insights
              </h3>
              <p className="text-xs text-gray-400">Generated just now</p>
            </div>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30">
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Projected Growth */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-bold text-white">Projected Growth (Next 30 Days)</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-gray-400 mb-1">Users</p>
              <p className="text-2xl font-bold text-green-400">{insights.projected_growth?.users}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-gray-400 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-blue-400">{insights.projected_growth?.sessions}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${insights.projected_growth?.confidence || 85}%` }}
                transition={{ duration: 1, ease: easeInOutCubic }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
            <span className="text-xs text-gray-400">{insights.projected_growth?.confidence || 85}% confidence</span>
          </div>
        </div>

        {/* Bottlenecks */}
        {insights.bottlenecks && insights.bottlenecks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-bold text-white">Potential Bottlenecks</h4>
            </div>
            <div className="space-y-2">
              {insights.bottlenecks.map((bottleneck, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{bottleneck.issue}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      bottleneck.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      bottleneck.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {bottleneck.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{bottleneck.impact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Recommended Actions</h4>
            </div>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="text-blue-400 font-bold">→</span>
                  {rec}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}