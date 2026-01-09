import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, XCircle, 
  GitBranch, AlertTriangle, Brain, Filter, Calendar, RefreshCw,
  ArrowUpRight, ArrowDownRight, Target, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";
import PerformanceHeatmap from "../components/analytics/PerformanceHeatmap";
import BranchComparison from "../components/analytics/BranchComparison";
import BottleneckAnalyzer from "../components/analytics/BottleneckAnalyzer";
import AIPredictiveInsights from "../components/analytics/AIPredictiveInsights";

export default function AdvancedAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedPipeline, setSelectedPipeline] = useState("all");

  const { data: runs = [], isLoading, refetch } = useQuery({
    queryKey: ['pipelineRuns', timeRange],
    queryFn: () => base44.entities.PipelineRun.list('-created_date', 500)
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.list()
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const rangeMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = rangeMap[timeRange] || 30;
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);

    let filtered = runs.filter(r => new Date(r.created_date) >= cutoff);
    if (selectedPipeline !== "all") {
      filtered = filtered.filter(r => r.pipeline_config_id === selectedPipeline);
    }

    const total = filtered.length;
    const successful = filtered.filter(r => r.status === "success").length;
    const failed = filtered.filter(r => r.status === "failed").length;
    const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0;
    const avgDuration = filtered.length > 0
      ? Math.round(filtered.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / filtered.length)
      : 0;

    // Trend data by day
    const dailyData = {};
    filtered.forEach(run => {
      const day = new Date(run.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[day]) {
        dailyData[day] = { day, total: 0, success: 0, failed: 0, duration: 0, durations: [] };
      }
      dailyData[day].total++;
      if (run.status === "success") dailyData[day].success++;
      if (run.status === "failed") dailyData[day].failed++;
      if (run.duration_seconds) dailyData[day].durations.push(run.duration_seconds);
    });

    const trendData = Object.values(dailyData).map(d => ({
      ...d,
      avgDuration: d.durations.length > 0 ? Math.round(d.durations.reduce((a, b) => a + b, 0) / d.durations.length) : 0,
      successRate: d.total > 0 ? Math.round(d.success / d.total * 100) : 0
    }));

    // Failure patterns
    const failureReasons = {};
    filtered.filter(r => r.status === "failed").forEach(run => {
      const reason = run.error_message?.split('\n')[0]?.substring(0, 50) || "Unknown";
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    const topFailures = Object.entries(failureReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count, percentage: ((count / failed) * 100).toFixed(1) }));

    // Branch performance
    const branchData = {};
    filtered.forEach(run => {
      const branch = run.branch || "unknown";
      if (!branchData[branch]) {
        branchData[branch] = { branch, total: 0, success: 0, durations: [] };
      }
      branchData[branch].total++;
      if (run.status === "success") branchData[branch].success++;
      if (run.duration_seconds) branchData[branch].durations.push(run.duration_seconds);
    });

    const branchPerformance = Object.values(branchData).map(b => ({
      branch: b.branch,
      total: b.total,
      successRate: b.total > 0 ? Math.round(b.success / b.total * 100) : 0,
      avgDuration: b.durations.length > 0 ? Math.round(b.durations.reduce((a, c) => a + c, 0) / b.durations.length) : 0
    }));

    // Previous period comparison
    const prevCutoff = new Date(cutoff - days * 24 * 60 * 60 * 1000);
    const prevFiltered = runs.filter(r => {
      const d = new Date(r.created_date);
      return d >= prevCutoff && d < cutoff;
    });
    const prevSuccessRate = prevFiltered.length > 0
      ? (prevFiltered.filter(r => r.status === "success").length / prevFiltered.length * 100)
      : 0;
    const prevAvgDuration = prevFiltered.length > 0
      ? Math.round(prevFiltered.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / prevFiltered.length)
      : 0;

    return {
      total, successful, failed, successRate, avgDuration,
      trendData, topFailures, branchPerformance,
      successRateTrend: parseFloat(successRate) - prevSuccessRate,
      durationTrend: avgDuration - prevAvgDuration,
      filtered
    };
  }, [runs, timeRange, selectedPipeline]);

  const COLORS = ['#FF7B00', '#00B4D8', '#10B981', '#8B5CF6', '#F59E0B'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Advanced Analytics
            </h1>
            <p className="text-gray-400">Deep insights into pipeline performance with AI predictions</p>
          </div>

          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="7d" className="text-white">7 Days</SelectItem>
                <SelectItem value="30d" className="text-white">30 Days</SelectItem>
                <SelectItem value="90d" className="text-white">90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all" className="text-white">All Pipelines</SelectItem>
                {configs.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => refetch()} variant="outline" className="border-white/10">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: "Total Runs", 
              value: analytics.total, 
              icon: Layers, 
              color: "#00B4D8",
              trend: null
            },
            { 
              label: "Success Rate", 
              value: `${analytics.successRate}%`, 
              icon: Target, 
              color: "#10B981",
              trend: analytics.successRateTrend,
              trendLabel: "vs prev period"
            },
            { 
              label: "Avg Duration", 
              value: `${Math.floor(analytics.avgDuration / 60)}m ${analytics.avgDuration % 60}s`, 
              icon: Clock, 
              color: "#F59E0B",
              trend: -analytics.durationTrend,
              trendLabel: "seconds saved",
              invertTrend: true
            },
            { 
              label: "Failed Builds", 
              value: analytics.failed, 
              icon: XCircle, 
              color: "#EF4444",
              trend: null
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                {stat.trend !== null && (
                  <div className={`flex items-center gap-1 text-xs ${stat.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.trend).toFixed(1)}{stat.invertTrend ? 's' : '%'}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="trends" className="data-[state=active]:bg-orange-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="branches" className="data-[state=active]:bg-orange-500/20">
              <GitBranch className="w-4 h-4 mr-2" />
              Branch Comparison
            </TabsTrigger>
            <TabsTrigger value="bottlenecks" className="data-[state=active]:bg-orange-500/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Bottlenecks
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-orange-500/20">
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Rate Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Success Rate Over Time
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analytics.trendData}>
                    <defs>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="successRate" stroke="#10B981" fill="url(#successGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Build Duration Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Average Build Duration
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
                      formatter={(value) => [`${Math.floor(value / 60)}m ${value % 60}s`, 'Duration']}
                    />
                    <Bar dataKey="avgDuration" fill="#FF7B00" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="avgDuration" stroke="#00B4D8" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Daily Volume */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Daily Build Volume
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend />
                    <Bar dataKey="success" stackId="a" fill="#10B981" name="Success" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Top Failure Reasons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Top Failure Reasons
                </h3>
                <div className="space-y-3">
                  {analytics.topFailures.map((failure, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                           style={{ background: `${COLORS[idx]}20`, color: COLORS[idx] }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white truncate">{failure.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" 
                                 style={{ width: `${failure.percentage}%`, background: COLORS[idx] }} />
                          </div>
                          <span className="text-xs text-gray-400">{failure.count} ({failure.percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {analytics.topFailures.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">No failures in this period 🎉</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Performance Heatmap */}
            <PerformanceHeatmap runs={analytics.filtered} />
          </TabsContent>

          <TabsContent value="branches">
            <BranchComparison 
              branchData={analytics.branchPerformance}
              runs={analytics.filtered}
              configs={configs}
            />
          </TabsContent>

          <TabsContent value="bottlenecks">
            <BottleneckAnalyzer runs={analytics.filtered} configs={configs} />
          </TabsContent>

          <TabsContent value="predictions">
            <AIPredictiveInsights 
              runs={analytics.filtered} 
              configs={configs}
              analytics={analytics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}