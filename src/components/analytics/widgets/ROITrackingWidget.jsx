/**
 * ROI Tracking Widget
 */
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export function ROITrackingWidget({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-semibold text-white">ROI Tracking</h3>
      
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs">Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-xl font-bold text-green-400">$24,580</p>
          <p className="text-green-400/60 text-xs">+18% vs last period</p>
        </div>

        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-white/70 text-xs">ROI</span>
          <p className="text-xl font-bold text-cyan-400">340%</p>
          <p className="text-cyan-400/60 text-xs">Cost: $7,200</p>
        </div>
      </div>
    </motion.div>
  );
}