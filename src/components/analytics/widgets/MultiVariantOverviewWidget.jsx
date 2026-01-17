/**
 * Multi-Variant Test Performance Overview Widget
 * Compare performance across multiple variants in a single test
 */
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export function MultiVariantOverviewWidget({ config, test }) {
  const variants = [
    { 
      name: 'Control (A)', 
      users: 5240, 
      conversions: 523, 
      rate: 9.97,
      trend: '+2.3%',
      status: 'baseline'
    },
    { 
      name: 'Variant B', 
      users: 5180, 
      conversions: 616, 
      rate: 11.89,
      trend: '+19.2%',
      status: 'winning'
    },
    { 
      name: 'Variant C', 
      users: 5120, 
      conversions: 486, 
      rate: 9.49,
      trend: '-4.8%',
      status: 'losing'
    },
    { 
      name: 'Variant D', 
      users: 5100, 
      conversions: 529, 
      rate: 10.37,
      trend: '+4.0%',
      status: 'neutral'
    },
  ];

  const maxRate = Math.max(...variants.map(v => v.rate));
  const winner = variants.find(v => v.status === 'winning');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        Multi-Variant Comparison
      </h3>

      <div className="space-y-2">
        {variants.map((variant, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-lg border ${
              variant.status === 'winning'
                ? 'bg-green-500/10 border-green-500/30'
                : variant.status === 'losing'
                ? 'bg-red-500/10 border-red-500/30'
                : variant.status === 'baseline'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {variant.status === 'winning' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
                {variant.status === 'losing' && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="font-semibold text-white text-sm">{variant.name}</span>
              </div>
              <span className={`text-xs font-bold ${
                variant.status === 'winning'
                  ? 'text-green-400'
                  : variant.status === 'losing'
                  ? 'text-red-400'
                  : 'text-white/60'
              }`}>
                {variant.trend}
              </span>
            </div>

            {/* Conversion Rate Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">
                  {variant.conversions} / {variant.users} conversions
                </span>
                <span className={`text-xs font-bold ${
                  variant.status === 'winning' ? 'text-green-400' : 'text-white'
                }`}>
                  {variant.rate.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(variant.rate / maxRate) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full ${
                    variant.status === 'winning'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : variant.status === 'losing'
                      ? 'bg-gradient-to-r from-red-500 to-orange-600'
                      : variant.status === 'baseline'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {winner && (
        <div className="p-3 rounded-lg bg-green-500/15 border border-green-500/40">
          <p className="text-xs text-white/70">Recommended Action</p>
          <p className="text-sm font-semibold text-green-400">
            Deploy {winner.name} - {((winner.rate - variants[0].rate) / variants[0].rate * 100).toFixed(1)}% better than control
          </p>
        </div>
      )}
    </motion.div>
  );
}