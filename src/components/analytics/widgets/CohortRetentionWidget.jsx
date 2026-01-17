/**
 * Cohort Retention Widget
 * Track user retention across cohorts over custom timeframes
 */
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CohortRetentionWidget({ config }) {
  const cohortData = [
    { cohort: 'Jan 1-7', w1: 100, w2: 85, w3: 72, w4: 58 },
    { cohort: 'Jan 8-14', w1: 100, w2: 82, w3: 68, w4: 52 },
    { cohort: 'Jan 15-21', w1: 100, w2: 88, w3: 75, w4: 61 },
    { cohort: 'Jan 22-28', w1: 100, w2: 84, w3: 70, w4: null },
    { cohort: 'Jan 29+', w1: 100, w2: 86, w3: null, w4: null },
  ];

  const displayData = cohortData.map(d => ({
    ...d,
    avgRetention: (d.w1 + (d.w2 || 0) + (d.w3 || 0) + (d.w4 || 0)) / 4,
  }));

  const colors = ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Cohort Retention Matrix</h3>
        <div className="flex gap-2">
          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => (
            <div key={i} className="text-xs">
              <div 
                className="w-3 h-3 rounded-full mb-1" 
                style={{ backgroundColor: colors[i] }}
              />
              <span className="text-white/60">{w}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={displayData} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis 
            dataKey="cohort" 
            type="category" 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            width={70}
          />
          <Tooltip 
            contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
            formatter={(value) => value ? `${value}%` : '-'}
          />
          <Bar dataKey="w1" fill={colors[0]} />
          <Bar dataKey="w2" fill={colors[1]} />
          <Bar dataKey="w3" fill={colors[2]} />
          <Bar dataKey="w4" fill={colors[3]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white/60">Avg Week 1 Retention</p>
          <p className="text-cyan-400 font-bold">100%</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white/60">Avg Week 4 Retention</p>
          <p className="text-purple-400 font-bold">56.5%</p>
        </div>
      </div>
    </motion.div>
  );
}