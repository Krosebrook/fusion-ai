/**
 * Variant Performance Widget
 */
import { motion } from 'framer-motion';

export function VariantPerformanceWidget({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-white">Variant Performance</h3>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs">Variant A</span>
            <span className="text-white font-semibold">45.2%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs">Variant B</span>
            <span className="text-white font-semibold">52.8%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '52.8%' }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-green-400 font-semibold pt-2">
        ✓ Variant B likely winner
      </div>
    </motion.div>
  );
}