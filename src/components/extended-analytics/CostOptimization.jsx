import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, Clock, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function CostOptimization({ runs, metrics, timeRange }) {
  const costData = useMemo(() => {
    // Group by date
    const byDate = {};
    runs.forEach(run => {
      const date = new Date(run.created_date).toLocaleDateString();
      if (!byDate[date]) {
        byDate[date] = { date, runs: 0, minutes: 0, cost: 0 };
      }
      byDate[date].runs++;
      byDate[date].minutes += (run.duration_seconds || 0) / 60;
      byDate[date].cost = byDate[date].minutes * 0.008;
    });

    return Object.values(byDate).slice(-30);
  }, [runs]);

  const optimizations = [
    {
      id: 1,
      title: 'Enable build caching',
      description: 'Cache node_modules and build artifacts between runs',
      savings: '$45.20/month',
      effort: 'Low',
      impact: 'High',
      implemented: false
    },
    {
      id: 2,
      title: 'Parallelize test suites',
      description: 'Run test suites in parallel across multiple runners',
      savings: '$32.80/month',
      effort: 'Medium',
      impact: 'High',
      implemented: false
    },
    {
      id: 3,
      title: 'Reduce branch builds',
      description: 'Only run full builds on main and release branches',
      savings: '$28.50/month',
      effort: 'Low',
      impact: 'Medium',
      implemented: true
    },
    {
      id: 4,
      title: 'Optimize Docker layers',
      description: 'Restructure Dockerfile for better layer caching',
      savings: '$18.30/month',
      effort: 'Medium',
      impact: 'Medium',
      implemented: false
    },
    {
      id: 5,
      title: 'Use spot instances',
      description: 'Run non-critical pipelines on cheaper spot instances',
      savings: '$56.00/month',
      effort: 'High',
      impact: 'High',
      implemented: false
    }
  ];

  const totalPotentialSavings = optimizations
    .filter(o => !o.implemented)
    .reduce((sum, o) => sum + parseFloat(o.savings.replace('$', '').replace('/month', '')), 0);

  const effortColors = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Compute Time', value: `${metrics.totalMinutes}m`, icon: Clock, color: '#00B4D8' },
          { label: 'Estimated Cost', value: `$${metrics.estimatedCost}`, icon: DollarSign, color: '#F59E0B' },
          { label: 'Cost Per Build', value: `$${metrics.avgCostPerBuild}`, icon: TrendingDown, color: '#8B5CF6' },
          { label: 'Potential Savings', value: `$${totalPotentialSavings.toFixed(2)}`, icon: Zap, color: '#10B981' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 p-4"
            style={{ background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
          >
            <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" />
            Cost Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={costData}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
              <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip 
                contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
                formatter={(v) => [`$${v.toFixed(2)}`, 'Cost']}
              />
              <Area type="monotone" dataKey="cost" stroke="#F59E0B" fill="url(#costGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Builds vs Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Build Volume & Compute
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
              <YAxis yAxisId="left" stroke="#94A3B8" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="runs" fill="#00B4D8" name="Builds" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="minutes" fill="#8B5CF6" name="Minutes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Optimization Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Cost Optimization Recommendations
          </h3>
          <span className="text-sm text-green-400">
            Potential savings: ${totalPotentialSavings.toFixed(2)}/month
          </span>
        </div>

        <div className="space-y-3">
          {optimizations.map((opt, idx) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                opt.implemented ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                {opt.implemented ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <div className="w-5 h-5 rounded border-2 border-gray-500" />
                )}
                <div>
                  <h4 className="font-medium text-white">{opt.title}</h4>
                  <p className="text-sm text-gray-400">{opt.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-green-400">{opt.savings}</p>
                  <p className="text-xs text-gray-500">estimated</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded text-xs"
                        style={{ background: `${effortColors[opt.effort]}20`, color: effortColors[opt.effort] }}>
                    {opt.effort} effort
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                    {opt.impact} impact
                  </span>
                </div>
                {!opt.implemented && (
                  <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                    Apply
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}