import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle2, TrendingUp, Clock } from 'lucide-react';

export function VariantMonitor({ test, metrics }) {
  const variantAMetrics = metrics.filter(m => m.variant === 'variant_a');
  const variantBMetrics = metrics.filter(m => m.variant === 'variant_b');

  const latestA = variantAMetrics[0];
  const latestB = variantBMetrics[0];

  const comparisonData = [
    {
      metric: 'Latency',
      'Variant A': latestA?.metrics?.avg_latency_ms || 0,
      'Variant B': latestB?.metrics?.avg_latency_ms || 0
    },
    {
      metric: 'Success Rate',
      'Variant A': (latestA?.metrics?.success_rate || 0) * 100,
      'Variant B': (latestB?.metrics?.success_rate || 0) * 100
    },
    {
      metric: 'Cost',
      'Variant A': latestA?.metrics?.avg_cost || 0,
      'Variant B': latestB?.metrics?.avg_cost || 0
    }
  ];

  const timelineData = metrics
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-20)
    .map(m => ({
      time: new Date(m.timestamp).getHours(),
      [m.variant]: m.metrics?.success_rate || 0
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.time === curr.time);
      if (existing) {
        return acc.map(item => item.time === curr.time ? { ...item, ...curr } : item);
      }
      return [...acc, curr];
    }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Variant A Requests', value: latestA?.request_count || 0, variant: 'A' },
          { label: 'Variant B Requests', value: latestB?.request_count || 0, variant: 'B' },
          { label: 'Variant A Success Rate', value: `${((latestA?.metrics?.success_rate || 0) * 100).toFixed(2)}%`, variant: 'A' },
          { label: 'Variant B Success Rate', value: `${((latestB?.metrics?.success_rate || 0) * 100).toFixed(2)}%`, variant: 'B' }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <p className="text-white/60 text-sm mb-1">{card.label}</p>
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/40 mt-1">Variant {card.variant}</p>
          </motion.div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Performance Comparison</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="metric" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Legend />
            <Bar dataKey="Variant A" fill="#06b6d4" />
            <Bar dataKey="Variant B" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Success Rate Timeline</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Line type="monotone" dataKey="variant_a" stroke="#06b6d4" strokeWidth={2} name="Variant A" />
            <Line type="monotone" dataKey="variant_b" stroke="#8b5cf6" strokeWidth={2} name="Variant B" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Winner Indicator */}
      {test.winner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-400 font-semibold">Test Winner: Variant {test.winner.toUpperCase()}</p>
            <p className="text-green-400/80 text-sm">Automatically promoted to production</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}