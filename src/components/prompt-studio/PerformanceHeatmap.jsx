/**
 * Performance Heatmap - Segment analysis visualization
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Activity } from 'lucide-react';

export function PerformanceHeatmap({ logs = [] }) {
  const [metric, setMetric] = useState('latency_ms');

  // Segment logs by time and input complexity
  const segments = {
    hours: ['00-06', '06-12', '12-18', '18-24'],
    complexity: ['simple', 'medium', 'complex']
  };

  const getSegmentData = (hour, complexity) => {
    const filtered = logs.filter(l => {
      const logHour = new Date(l.created_date).getHours();
      const hourMatch = logHour >= parseInt(hour.split('-')[0]) && logHour < parseInt(hour.split('-')[1]);
      return hourMatch;
    });

    if (filtered.length === 0) return null;
    
    const avg = filtered.reduce((sum, l) => sum + (l[metric] || 0), 0) / filtered.length;
    return avg;
  };

  const allValues = segments.hours.flatMap(h => 
    segments.complexity.map(c => getSegmentData(h, c))
  ).filter(v => v != null);

  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);

  const getHeatColor = (value) => {
    if (!value) return 'bg-gray-800/50';
    const intensity = (value - min) / (max - min);
    
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-green-500';
    return 'bg-cyan-500';
  };

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Performance Heatmap</h2>
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="latency_ms">Latency</option>
          <option value="cost_usd">Cost</option>
          <option value="quality_score">Quality</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-white/60 text-xs text-left">Complexity</th>
              {segments.hours.map(h => (
                <th key={h} className="p-2 text-white/60 text-xs text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.complexity.map((complexity, i) => (
              <tr key={complexity}>
                <td className="p-2 text-white/80 text-xs capitalize">{complexity}</td>
                {segments.hours.map((hour, j) => {
                  const value = getSegmentData(hour, complexity);
                  return (
                    <td key={hour} className="p-1">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (i * segments.hours.length + j) * 0.02 }}
                        className={`h-16 w-16 rounded-lg ${getHeatColor(value)} flex items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
                        title={value ? `${value.toFixed(2)}` : 'No data'}
                      >
                        {value && (
                          <span className="text-white text-xs font-bold">
                            {value.toFixed(0)}
                          </span>
                        )}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-white/60">
        <span>Low</span>
        <div className="flex gap-1">
          {['bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-600'].map((color, i) => (
            <div key={i} className={`w-6 h-4 ${color} rounded`} />
          ))}
        </div>
        <span>High</span>
      </div>
    </CinematicCard>
  );
}