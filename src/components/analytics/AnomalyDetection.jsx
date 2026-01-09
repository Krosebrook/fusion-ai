import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      type: "traffic_spike",
      severity: "high",
      message: "Unusual traffic spike detected: 340% increase in /dashboard endpoint",
      timestamp: new Date(),
      metric: "Page Views",
      value: "8,432 → 37,098",
      dismissed: false
    },
    {
      id: 2,
      type: "conversion_drop",
      severity: "medium",
      message: "Conversion rate dropped 25% in the last 2 hours",
      timestamp: new Date(Date.now() - 3600000),
      metric: "Conversions",
      value: "42% → 31.5%",
      dismissed: false
    }
  ]);

  const dismissAnomaly = (id) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
    setTimeout(() => {
      setAnomalies(prev => prev.filter(a => a.id !== id));
    }, 300);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' };
      case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-400' };
      case 'low': return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' };
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', icon: 'text-gray-400' };
    }
  };

  const activeAnomalies = anomalies.filter(a => !a.dismissed);

  if (activeAnomalies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-500/30 p-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
          backdropFilter: "blur(10px)"
        }}
      >
        <CheckCircle className="w-5 h-5 text-green-400" />
        <p className="text-sm text-green-400 font-medium">All metrics normal - No anomalies detected</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {activeAnomalies.map((anomaly, idx) => {
          const colors = getSeverityColor(anomaly.severity);
          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.05, ease: easeInOutCubic }}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-4 relative overflow-hidden`}
              style={{ backdropFilter: "blur(10px)" }}
            >
              {/* Pulse animation */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 20% 50%, ${colors.text.replace('text-', '')}15, transparent 70%)`
                }}
              />

              <div className="relative flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <AlertCircle className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase ${colors.text}`}>
                      {anomaly.severity} Severity
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(anomaly.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-white mb-2">
                    {anomaly.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400">
                      <span className="font-medium">{anomaly.metric}:</span> {anomaly.value}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissAnomaly(anomaly.id)}
                  className="hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}