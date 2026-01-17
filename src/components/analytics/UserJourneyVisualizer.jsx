/**
 * User Journey Visualizer
 * Interactive path exploration with anomaly highlighting
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

export function UserJourneyVisualizer() {
  const [selectedPath, setSelectedPath] = useState(null);

  const { data: journeys } = useQuery({
    queryKey: ['user-journeys'],
    queryFn: async () => {
      const result = await base44.functions.invoke('mapUserJourneys', {});
      return result?.analysis || {};
    },
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-2">User Journey Map</h2>
        <p className="text-white/60">Identify patterns, drop-offs, and optimization opportunities</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Paths */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Top Paths
            </h3>
            <div className="space-y-3">
              {journeys?.topPaths?.slice(0, 3).map((path, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPath(path)}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all"
                >
                  <p className="text-xs font-mono text-cyan-400 truncate">{path.path}</p>
                  <p className="text-xs text-white/60 mt-1">{path.users} users</p>
                </motion.div>
              ))}
            </div>
          </CinematicCard>
        </motion.div>

        {/* Drop-off Points */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CinematicCard className="p-6 bg-red-500/10 border-red-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Drop-off Points
            </h3>
            <div className="space-y-3">
              {journeys?.dropoffPoints?.slice(0, 3).map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-xs font-bold text-red-300">{point.fromStep} → {point.toStep}</p>
                  <p className="text-xs text-white/60 mt-1">{point.abandonment.toFixed(1)}% abandon</p>
                </motion.div>
              ))}
            </div>
          </CinematicCard>
        </motion.div>

        {/* Opportunities */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <CinematicCard className="p-6 bg-green-500/10 border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Opportunities
            </h3>
            <div className="space-y-3">
              {journeys?.opportunities?.slice(0, 3).map((opp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <p className="text-xs font-bold text-green-300">{opp.title}</p>
                  <p className="text-xs text-white/60 mt-1">Estimated lift: {opp.estimatedLift}</p>
                </motion.div>
              ))}
            </div>
          </CinematicCard>
        </motion.div>
      </div>
    </div>
  );
}