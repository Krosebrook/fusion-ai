import React from "react";
import { motion } from "framer-motion";
import { Clock, Users, Calendar } from "lucide-react";

export default function EffortEstimator({ features }) {
  const totalHours = features.reduce((sum, f) => sum + f.effort_hours, 0);
  const totalDays = Math.ceil(totalHours / 8);
  const totalWeeks = Math.ceil(totalDays / 5);

  const effortByCategory = features.reduce((acc, feature) => {
    const category = feature.effort_category || "medium";
    acc[category] = (acc[category] || 0) + feature.effort_hours;
    return acc;
  }, {});

  const categoryColors = {
    small: { color: "#10B981", label: "Small (<8h)" },
    medium: { color: "#00B4D8", label: "Medium (8-24h)" },
    large: { color: "#F59E0B", label: "Large (>24h)" }
  };

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
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Effort Estimation
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-blue-500/30 p-6 bg-blue-500/10"
        >
          <Clock className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-3xl font-bold text-white">{totalHours}h</p>
          <p className="text-sm text-gray-400 mt-1">Total Hours</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-green-500/30 p-6 bg-green-500/10"
        >
          <Calendar className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-3xl font-bold text-white">{totalWeeks}w</p>
          <p className="text-sm text-gray-400 mt-1">Estimated Duration</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-purple-500/30 p-6 bg-purple-500/10"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-3xl font-bold text-white">{Math.ceil(totalHours / 160)}</p>
          <p className="text-sm text-gray-400 mt-1">Dev Months (1 FTE)</p>
        </motion.div>
      </div>

      {/* Effort Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Effort Breakdown</h4>
        {Object.entries(effortByCategory).map(([category, hours], idx) => {
          const color = categoryColors[category]?.color || "#6B7280";
          const label = categoryColors[category]?.label || category;
          const percentage = (hours / totalHours) * 100;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-sm text-gray-400">{hours}h ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}