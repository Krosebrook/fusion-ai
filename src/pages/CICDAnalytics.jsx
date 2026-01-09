import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, AlertCircle, CheckCircle2, GitBranch } from "lucide-react";

const glassCard = {
  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
};

export default function CICDAnalyticsPage() {
  const { data: pipelineRuns = [], isLoading } = useQuery({
    queryKey: ['pipelineRuns'],
    queryFn: () => base44.entities.PipelineRun.list('-created_date', 100),
    initialData: []
  });

  const analytics = useMemo(() => {
    if (!pipelineRuns.length) return null;

    const total = pipelineRuns.length;
    const successful = pipelineRuns.filter(r => r.status === 'success').length;
    const failed = pipelineRuns.filter(r => r.status === 'failed').length;
    const successRate = ((successful / total) * 100).toFixed(1);

    const avgDuration = pipelineRuns
      .filter(r => r.duration_seconds)
      .reduce((sum, r) => sum + r.duration_seconds, 0) / total;

    // Success rate over time (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const successOverTime = last30Days.map(date => {
      const dayRuns = pipelineRuns.filter(r => 
        r.created_date && r.created_date.startsWith(date)
      );
      const daySuccess = dayRuns.filter(r => r.status === 'success').length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: dayRuns.length ? ((daySuccess / dayRuns.length) * 100).toFixed(0) : 0,
        total: dayRuns.length
      };
    });

    // Deployment frequency by day of week
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const deploymentsByDay = dayOfWeek.map((day, idx) => {
      const count = pipelineRuns.filter(r => {
        const runDate = new Date(r.created_date);
        return runDate.getDay() === idx;
      }).length;
      return { day, count };
    });

    // Common failure points
    const failureReasons = {};
    pipelineRuns.filter(r => r.status === 'failed').forEach(r => {
      const reason = r.error_message || 'Unknown error';
      const key = reason.substring(0, 50);
      failureReasons[key] = (failureReasons[key] || 0) + 1;
    });

    const topFailures = Object.entries(failureReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status distribution
    const statusDist = [
      { name: 'Success', value: successful, color: '#10B981' },
      { name: 'Failed', value: failed, color: '#EF4444' },
      { name: 'Running', value: pipelineRuns.filter(r => r.status === 'running').length, color: '#F59E0B' },
      { name: 'Pending', value: pipelineRuns.filter(r => r.status === 'pending').length, color: '#6B7280' }
    ].filter(s => s.value > 0);

    return {
      total,
      successful,
      failed,
      successRate,
      avgDuration: Math.floor(avgDuration / 60),
      successOverTime,
      deploymentsByDay,
      topFailures,
      statusDist
    };
  }, [pipelineRuns]);

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Runs", value: analytics.total, icon: Activity, color: "#00B4D8", trend: null },
    { label: "Success Rate", value: `${analytics.successRate}%`, icon: CheckCircle2, color: "#10B981", trend: analytics.successRate > 80 ? "up" : "down" },
    { label: "Avg Duration", value: `${analytics.avgDuration}m`, icon: Clock, color: "#F59E0B", trend: null },
    { label: "Failed Runs", value: analytics.failed, icon: AlertCircle, color: "#EF4444", trend: analytics.failed > 10 ? "down" : null }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            CI/CD Analytics
          </h1>
          <p className="text-gray-400">Performance metrics and insights for your pipelines</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={glassCard}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                {stat.trend && (
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Success Rate Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 p-6"
            style={glassCard}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <TrendingUp className="w-5 h-5 text-green-400" />
              Success Rate Trend (30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.successOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 p-6"
            style={glassCard}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Activity className="w-5 h-5 text-blue-400" />
              Pipeline Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.statusDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Deployment Frequency by Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 p-6"
            style={glassCard}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <GitBranch className="w-5 h-5 text-purple-400" />
              Deployment Frequency by Day
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.deploymentsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Common Failure Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/10 p-6"
            style={glassCard}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <AlertCircle className="w-5 h-5 text-red-400" />
              Top Failure Points
            </h3>
            <div className="space-y-3">
              {analytics.topFailures.map((failure, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{failure.reason}</span>
                    <span className="text-xs text-red-400 font-semibold">{failure.count}x</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(failure.count / analytics.failed) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}