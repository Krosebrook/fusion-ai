/**
 * Correlation Matrix - Metric relationships and dependencies
 */

import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';

export function CorrelationMatrix({ logs = [] }) {
  const metrics = ['latency_ms', 'cost_usd', 'quality_score', 'tokens.total'];
  
  const calculateCorrelation = (metric1, metric2) => {
    const values1 = logs.map(l => getNestedValue(l, metric1)).filter(v => v != null);
    const values2 = logs.map(l => getNestedValue(l, metric2)).filter(v => v != null);
    
    if (values1.length < 2) return 0;
    
    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
    
    const numerator = values1.reduce((sum, v1, i) => sum + (v1 - mean1) * (values2[i] - mean2), 0);
    const denom1 = Math.sqrt(values1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0));
    const denom2 = Math.sqrt(values2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0));
    
    return denom1 && denom2 ? numerator / (denom1 * denom2) : 0;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  const getColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return correlation > 0 ? 'bg-green-500' : 'bg-red-500';
    if (abs > 0.4) return correlation > 0 ? 'bg-green-500/60' : 'bg-red-500/60';
    return 'bg-gray-500/30';
  };

  return (
    <CinematicCard className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Correlation Matrix</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-white/60 text-xs text-left">Metric</th>
              {metrics.map(m => (
                <th key={m} className="p-2 text-white/60 text-xs text-center">
                  {m.split('.').pop()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m1, i) => (
              <tr key={m1}>
                <td className="p-2 text-white/80 text-xs font-mono">{m1.split('.').pop()}</td>
                {metrics.map((m2, j) => {
                  const corr = calculateCorrelation(m1, m2);
                  return (
                    <td key={m2} className="p-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (i * metrics.length + j) * 0.01 }}
                        className={`h-12 w-12 rounded flex items-center justify-center ${getColor(corr)}`}
                      >
                        <span className="text-white text-xs font-bold">
                          {corr.toFixed(2)}
                        </span>
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Positive correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Negative correlation</span>
        </div>
      </div>
    </CinematicCard>
  );
}