import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, Activity, Bell, Filter } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';

export function MonitoringOnboarding({ onComplete, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl"
      >
        <CinematicCard className="p-6 relative">
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-white/60"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Activity className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Real-Time Monitoring</h3>
              <p className="text-white/60 text-sm">Track prompts and agents live</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Live Metrics</h4>
                  <p className="text-white/70 text-sm">Monitor requests/sec, latency, success rate, cost, and active alerts in real-time</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Filter className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Smart Filtering</h4>
                  <p className="text-white/70 text-sm">Filter by environment (dev/staging/prod) and time range to focus on what matters</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Instant Alerts</h4>
                  <p className="text-white/70 text-sm">Get notified immediately when failures occur or performance degrades</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <Check className="w-4 h-4 mr-2" />
            Start Monitoring
          </Button>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}