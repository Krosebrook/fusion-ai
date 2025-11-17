import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap, Code } from "lucide-react";

export default function CodeReviewPanel({ data }) {
  const metrics = [
    { label: "Maintainability", value: data.metrics.maintainability, icon: Code, color: "#10B981" },
    { label: "Security", value: data.metrics.security, icon: Shield, color: "#00B4D8" },
    { label: "Performance", value: data.metrics.performance, icon: Zap, color: "#8B5CF6" },
    { label: "Best Practices", value: data.metrics.best_practices, icon: TrendingUp, color: "#F59E0B" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-8"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Code Quality Summary</h3>
        <p className="text-gray-400">{data.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}20` }}>
                  <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <span className="text-sm font-medium text-white">{metric.label}</span>
              </div>
              <span className="text-2xl font-bold text-white">{metric.value}/10</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(metric.value / 10) * 100}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className="h-full"
                style={{ backgroundColor: metric.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}