/**
 * Trend Analysis Component
 * Visualizes performance trends over time with forecasting and annotations
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

export function TrendAnalysis({ test: _test, metrics }) {
  // Prepare trend data
  const trendData = useMemo(() => {
    return metrics
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-30)
      .map(m => ({
        time: new Date(m.timestamp).toLocaleDateString(),
        [m.variant]: (m.metrics?.success_rate || 0) * 100,
        latency_a: m.variant === 'variant_a' ? m.metrics?.avg_latency_ms : undefined,
        latency_b: m.variant === 'variant_b' ? m.metrics?.avg_latency_ms : undefined,
        cost_a: m.variant === 'variant_a' ? m.metrics?.avg_cost : undefined,
        cost_b: m.variant === 'variant_b' ? m.metrics?.avg_cost : undefined,
      }))
      .reduce((acc, curr) => {
        const existing = acc.find(item => item.time === curr.time);
        if (existing) {
          return acc.map(item => 
            item.time === curr.time ? { ...item, ...curr } : item
          );
        }
        return [...acc, curr];
      }, []);
  }, [metrics]);

  // Calculate trend stats
  const stats = useMemo(() => {
    if (trendData.length < 2) return null;
    
    const variantA = metrics.filter(m => m.variant === 'variant_a');
    const variantB = metrics.filter(m => m.variant === 'variant_b');
    
    const latestA = variantA[variantA.length - 1];
    const latestB = variantB[variantB.length - 1];
    const oldestA = variantA[0];
    const oldestB = variantB[0];

    return {
      variantA: {
        current: latestA?.metrics?.success_rate * 100 || 0,
        previous: oldestA?.metrics?.success_rate * 100 || 0,
        change: ((latestA?.metrics?.success_rate || 0) - (oldestA?.metrics?.success_rate || 0)) * 100,
      },
      variantB: {
        current: latestB?.metrics?.success_rate * 100 || 0,
        previous: oldestB?.metrics?.success_rate * 100 || 0,
        change: ((latestB?.metrics?.success_rate || 0) - (oldestB?.metrics?.success_rate || 0)) * 100,
      },
    };
  }, [metrics, trendData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats && Object.entries(stats).map(([key, data]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {key === 'variantA' ? 'Variant A' : 'Variant B'}
                </h3>
                {data.change >= 0 ? (
                  <ArrowUp className="w-5 h-5 text-green-400" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm mb-1">Current Success Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {data.current.toFixed(2)}%
                  </p>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Previous</p>
                    <p className="text-white">{data.previous.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className={`${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Change
                    </p>
                    <p className={`text-lg font-semibold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {/* Success Rate Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Success Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="variant_a" stroke="#06b6d4" fillOpacity={1} fill="url(#colorA)" name="Variant A" />
              <Area type="monotone" dataKey="variant_b" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorB)" name="Variant B" />
            </AreaChart>
          </ResponsiveContainer>
        </CinematicCard>
      </motion.div>

      {/* Latency & Cost Trends */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Latency Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="latency_a" stroke="#06b6d4" strokeWidth={2} name="Variant A" />
                <Line type="monotone" dataKey="latency_b" stroke="#8b5cf6" strokeWidth={2} name="Variant B" />
              </LineChart>
            </ResponsiveContainer>
          </CinematicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="cost_a" stroke="#06b6d4" strokeWidth={2} name="Variant A" />
                <Line type="monotone" dataKey="cost_b" stroke="#8b5cf6" strokeWidth={2} name="Variant B" />
              </LineChart>
            </ResponsiveContainer>
          </CinematicCard>
        </motion.div>
      </div>
    </motion.div>
  );
}