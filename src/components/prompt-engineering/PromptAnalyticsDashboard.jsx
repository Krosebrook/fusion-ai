import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, TrendingUp, TrendingDown, Clock, Zap, DollarSign, CheckCircle2,
  AlertCircle, Star, ArrowUpRight, ArrowDownRight, Activity, Target
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

const COLORS = ["#FF7B00", "#00B4D8", "#10B981", "#8B5CF6", "#E91E63", "#F59E0B"];

export default function PromptAnalyticsDashboard({ templateId }) {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: executionLogs = [] } = useQuery({
    queryKey: ['promptExecutionLogs', templateId, timeRange],
    queryFn: async () => {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days).toISOString();
      
      if (templateId) {
        return base44.entities.PromptExecutionLog.filter({
          prompt_template_id: templateId,
          created_date: { $gte: startDate }
        }, '-created_date', 1000);
      }
      return base44.entities.PromptExecutionLog.filter({
        created_date: { $gte: startDate }
      }, '-created_date', 1000);
    }
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['promptTemplates'],
    queryFn: () => base44.entities.PromptTemplate.list('-usage_count', 10)
  });

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (executionLogs.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        avgLatency: 0,
        avgCost: 0,
        totalTokens: 0,
        avgQualityScore: 0
      };
    }

    const successful = executionLogs.filter(l => l.status === "success");
    const totalTokens = executionLogs.reduce((sum, l) => sum + (l.tokens?.total || 0), 0);
    const totalCost = executionLogs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);
    const avgLatency = executionLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / executionLogs.length;
    const withQuality = executionLogs.filter(l => l.quality_scores?.auto_score);
    const avgQuality = withQuality.length > 0
      ? withQuality.reduce((sum, l) => sum + l.quality_scores.auto_score, 0) / withQuality.length
      : 0;

    return {
      totalExecutions: executionLogs.length,
      successRate: (successful.length / executionLogs.length) * 100,
      avgLatency: Math.round(avgLatency),
      avgCost: totalCost / executionLogs.length,
      totalTokens,
      avgQualityScore: avgQuality
    };
  }, [executionLogs]);

  // Daily trend data
  const trendData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const dates = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dates.map(date => {
      const dayLogs = executionLogs.filter(l => 
        format(new Date(l.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const successful = dayLogs.filter(l => l.status === "success");
      
      return {
        date: format(date, 'MMM d'),
        executions: dayLogs.length,
        successRate: dayLogs.length > 0 ? (successful.length / dayLogs.length) * 100 : 0,
        avgLatency: dayLogs.length > 0 
          ? dayLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / dayLogs.length 
          : 0,
        cost: dayLogs.reduce((sum, l) => sum + (l.cost_usd || 0), 0)
      };
    });
  }, [executionLogs, timeRange]);

  // Model distribution
  const modelDistribution = React.useMemo(() => {
    const modelCounts = {};
    executionLogs.forEach(l => {
      const model = l.model_used || "unknown";
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    
    return Object.entries(modelCounts).map(([name, value]) => ({ name, value }));
  }, [executionLogs]);

  // Status distribution
  const statusDistribution = React.useMemo(() => {
    const statusCounts = { success: 0, failed: 0, timeout: 0 };
    executionLogs.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [executionLogs]);

  // Top templates by usage
  const topTemplates = templates.slice(0, 5).map(t => ({
    name: t.name.length > 20 ? t.name.substring(0, 20) + "..." : t.name,
    executions: t.usage_count || 0,
    latency: t.avg_latency_ms || 0,
    successRate: t.success_rate || 0
  }));

  const statCards = [
    { 
      label: "Total Executions", 
      value: metrics.totalExecutions.toLocaleString(), 
      icon: Zap, 
      color: "#FF7B00",
      trend: "+12%",
      trendUp: true
    },
    { 
      label: "Success Rate", 
      value: `${metrics.successRate.toFixed(1)}%`, 
      icon: CheckCircle2, 
      color: "#10B981",
      trend: "+2.3%",
      trendUp: true
    },
    { 
      label: "Avg Latency", 
      value: `${metrics.avgLatency}ms`, 
      icon: Clock, 
      color: "#00B4D8",
      trend: "-8%",
      trendUp: true
    },
    { 
      label: "Avg Cost", 
      value: `$${metrics.avgCost.toFixed(4)}`, 
      icon: DollarSign, 
      color: "#8B5CF6",
      trend: "-5%",
      trendUp: true
    },
    { 
      label: "Total Tokens", 
      value: metrics.totalTokens.toLocaleString(), 
      icon: Activity, 
      color: "#E91E63",
      trend: "+18%",
      trendUp: true
    },
    { 
      label: "Quality Score", 
      value: metrics.avgQualityScore.toFixed(1), 
      icon: Star, 
      color: "#F59E0B",
      trend: "+0.2",
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          Performance Analytics
        </h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem value="7d" className="text-white">Last 7 days</SelectItem>
            <SelectItem value="30d" className="text-white">Last 30 days</SelectItem>
            <SelectItem value="90d" className="text-white">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 p-4"
            style={{ background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executions Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-4">Executions Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="executionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7B00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF7B00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="executions" 
                stroke="#FF7B00" 
                fill="url(#executionsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Success Rate Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-4">Success Rate & Latency Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#10B981" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#00B4D8" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="successRate" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="Success Rate (%)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgLatency" 
                stroke="#00B4D8" 
                strokeWidth={2}
                dot={false}
                name="Avg Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-4">Model Usage</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={modelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {modelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {modelDistribution.map((item, idx) => (
              <Badge key={item.name} style={{ backgroundColor: `${COLORS[idx % COLORS.length]}20`, color: COLORS[idx % COLORS.length] }}>
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-4">Status Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} width={60} />
              <Tooltip 
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statusDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'success' ? '#10B981' : entry.name === 'failed' ? '#EF4444' : '#F59E0B'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/10 p-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-4">Top Templates</h4>
          <div className="space-y-3">
            {topTemplates.map((template, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${COLORS[idx]}20`, color: COLORS[idx] }}>
                    {idx + 1}
                  </span>
                  <span className="text-sm text-white truncate max-w-[120px]">{template.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {template.executions} runs
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cost Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border border-white/10 p-5"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h4 className="text-sm font-medium text-white mb-4">Cost Over Time</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
            <Tooltip 
              contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => [`$${value.toFixed(4)}`, 'Cost']}
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#8B5CF6" 
              fill="url(#costGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}