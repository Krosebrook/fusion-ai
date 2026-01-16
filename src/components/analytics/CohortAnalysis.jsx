/**
 * Cohort Analysis Component
 * Segments users by time cohorts and displays performance progression
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Users, Calendar } from 'lucide-react';

export function CohortAnalysis({ test, metrics }) {
  // Create cohort data by date
  const cohortData = useMemo(() => {
    const cohorts = {};

    metrics.forEach(m => {
      const date = new Date(m.timestamp).toLocaleDateString();
      if (!cohorts[date]) {
        cohorts[date] = {
          date,
          variant_a_count: 0,
          variant_b_count: 0,
          variant_a_success: 0,
          variant_b_success: 0,
        };
      }

      if (m.variant === 'variant_a') {
        cohorts[date].variant_a_count += m.request_count || 0;
        cohorts[date].variant_a_success += (m.metrics?.success_rate || 0) * (m.request_count || 0);
      } else {
        cohorts[date].variant_b_count += m.request_count || 0;
        cohorts[date].variant_b_success += (m.metrics?.success_rate || 0) * (m.request_count || 0);
      }
    });

    return Object.values(cohorts).map(cohort => ({
      ...cohort,
      variant_a_rate: cohort.variant_a_count > 0 ? (cohort.variant_a_success / cohort.variant_a_count) * 100 : 0,
      variant_b_rate: cohort.variant_b_count > 0 ? (cohort.variant_b_success / cohort.variant_b_count) * 100 : 0,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [metrics]);

  // Retention analysis
  const retentionData = useMemo(() => {
    if (cohortData.length < 2) return [];

    return cohortData.map((cohort, idx) => ({
      cohort: cohort.date,
      day0_a: cohort.variant_a_rate.toFixed(1),
      day0_b: cohort.variant_b_rate.toFixed(1),
      retention: idx > 0 ? (
        (cohort.variant_a_rate + cohort.variant_b_rate) / 2
      ).toFixed(1) : '100',
      users_a: cohort.variant_a_count,
      users_b: cohort.variant_b_count,
    }));
  }, [cohortData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Cohort Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CinematicCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white/80">Cohorts</h3>
            </div>
            <p className="text-3xl font-bold text-white">{cohortData.length}</p>
            <p className="text-sm text-white/60 mt-2">Daily cohorts tracked</p>
          </CinematicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CinematicCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-white/80">Variant A Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {cohortData.reduce((sum, c) => sum + c.variant_a_count, 0).toLocaleString()}
            </p>
            <p className="text-sm text-white/60 mt-2">Total interactions</p>
          </CinematicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CinematicCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white/80">Variant B Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {cohortData.reduce((sum, c) => sum + c.variant_b_count, 0).toLocaleString()}
            </p>
            <p className="text-sm text-white/60 mt-2">Total interactions</p>
          </CinematicCard>
        </motion.div>
      </div>

      {/* Cohort Retention Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cohort Retention & Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/80">Cohort Date</th>
                  <th className="text-right py-3 px-4 text-white/80">Users A</th>
                  <th className="text-right py-3 px-4 text-white/80">Users B</th>
                  <th className="text-right py-3 px-4 text-white/80">Success A</th>
                  <th className="text-right py-3 px-4 text-white/80">Success B</th>
                  <th className="text-right py-3 px-4 text-white/80">Avg Performance</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-white">{row.cohort}</td>
                    <td className="text-right py-3 px-4 text-cyan-400">{row.users_a.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-purple-400">{row.users_b.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-white">{row.day0_a}%</td>
                    <td className="text-right py-3 px-4 text-white">{row.day0_b}%</td>
                    <td className="text-right py-3 px-4">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                          style={{ width: `${row.retention}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Performance by Cohort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Success Rate by Cohort</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
              <Bar dataKey="variant_a_rate" fill="#06b6d4" name="Variant A Success Rate" />
              <Bar dataKey="variant_b_rate" fill="#8b5cf6" name="Variant B Success Rate" />
            </BarChart>
          </ResponsiveContainer>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}