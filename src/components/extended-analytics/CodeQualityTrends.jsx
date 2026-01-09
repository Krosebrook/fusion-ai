import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Code } from "lucide-react";
import { AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function CodeQualityTrends({ data, qualityChecks }) {
  // Issue breakdown
  const totalIssues = {
    critical: data.reduce((sum, d) => sum + (d.critical || 0), 0),
    high: data.reduce((sum, d) => sum + (d.high || 0), 0),
    medium: data.reduce((sum, d) => sum + (d.medium || 0), 0),
    low: data.reduce((sum, d) => sum + (d.low || 0), 0)
  };

  // Tool breakdown
  const toolBreakdown = {};
  qualityChecks.forEach(check => {
    if (!toolBreakdown[check.tool]) {
      toolBreakdown[check.tool] = { count: 0, passed: 0, avgScore: [] };
    }
    toolBreakdown[check.tool].count++;
    if (check.passed_gates) toolBreakdown[check.tool].passed++;
    if (check.score) toolBreakdown[check.tool].avgScore.push(check.score);
  });

  const toolStats = Object.entries(toolBreakdown).map(([tool, stats]) => ({
    tool,
    count: stats.count,
    passRate: stats.count > 0 ? Math.round(stats.passed / stats.count * 100) : 0,
    avgScore: stats.avgScore.length > 0 
      ? Math.round(stats.avgScore.reduce((a, b) => a + b, 0) / stats.avgScore.length) 
      : 0
  }));

  const issueColors = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#8B5CF6',
    low: '#00B4D8'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Quality Score Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
              <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="avgScore" stroke="#10B981" fill="url(#qualityGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Issues by Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Issues by Severity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
              <YAxis stroke="#94A3B8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill={issueColors.critical} name="Critical" />
              <Bar dataKey="high" stackId="a" fill={issueColors.high} name="High" />
              <Bar dataKey="medium" stackId="a" fill={issueColors.medium} name="Medium" />
              <Bar dataKey="low" stackId="a" fill={issueColors.low} name="Low" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Issue Summary & Tool Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Issue Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(totalIssues).map(([severity, count]) => (
              <div 
                key={severity}
                className="p-4 rounded-lg"
                style={{ background: `${issueColors[severity]}15` }}
              >
                <p className="text-2xl font-bold" style={{ color: issueColors[severity] }}>{count}</p>
                <p className="text-sm text-gray-400 capitalize">{severity}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tool Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            Quality Tools Performance
          </h3>
          <div className="space-y-3">
            {toolStats.map(tool => (
              <div key={tool.tool} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white capitalize">{tool.tool}</span>
                  <span className="text-xs text-gray-500">{tool.count} checks</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-white">{tool.passRate}%</p>
                    <p className="text-xs text-gray-500">Pass Rate</p>
                  </div>
                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${tool.passRate}%`,
                        background: tool.passRate >= 80 ? '#10B981' : tool.passRate >= 50 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {toolStats.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No quality checks recorded</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}