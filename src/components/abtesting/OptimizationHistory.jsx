/**
 * Optimization History Component
 * 
 * Display historical AI optimizations and their outcomes.
 */
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function OptimizationHistory({ optimizations, tests }) {
  if (optimizations.length === 0) {
    return (
      <CinematicCard className="p-12 text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-white/40 mb-4" />
        <p className="text-white/60">No optimization history yet</p>
      </CinematicCard>
    );
  }

  return (
    <div className="space-y-4">
      {optimizations.map((opt, idx) => {
        const test = tests.find(t => t.id === opt.test_id);
        const recommendation = opt.recommendations?.[0];

        return (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{test?.name}</h3>
                  <p className="text-white/60 text-sm">
                    {format(new Date(opt.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {opt.applied && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Applied</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-white/60 text-xs mb-1">Winner</p>
                  <p className="text-white font-bold capitalize">
                    {opt.analysis.predicted_winner}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Probability</p>
                  <p className="text-green-400 font-bold">
                    {(opt.analysis.win_probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Predicted Lift</p>
                  <p className="text-cyan-400 font-bold">
                    +{opt.analysis.predicted_improvement?.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Recommendation</p>
                  <p className="text-white font-bold capitalize text-sm">
                    {recommendation?.action.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {opt.outcome && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-blue-300 text-sm">{opt.outcome}</p>
                </div>
              )}
            </CinematicCard>
          </motion.div>
        );
      })}
    </div>
  );
}