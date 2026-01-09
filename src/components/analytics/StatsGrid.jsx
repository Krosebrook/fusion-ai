import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function StatsGrid({ stats = [] }) {
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-400 bg-green-500/20";
    if (trend < 0) return "text-red-400 bg-red-500/20";
    return "text-gray-400 bg-gray-500/20";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: idx * 0.1, 
            duration: 0.6, 
            ease: easeInOutCubic 
          }}
          whileHover={{ 
            scale: 1.02, 
            y: -4,
            transition: { duration: 0.2 }
          }}
          className="relative rounded-2xl border border-white/10 overflow-hidden group cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Animated gradient on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${stat.color}15 0%, transparent 70%)`
            }}
          />

          <div className="relative p-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: idx * 0.1 + 0.2, 
                duration: 0.5,
                type: "spring",
                stiffness: 200
              }}
              className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)`,
                boxShadow: `0 8px 24px ${stat.color}20`
              }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </motion.div>

            {/* Label */}
            <p className="text-sm font-medium text-gray-400 mb-2">{stat.label}</p>

            {/* Value */}
            <div className="flex items-end justify-between mb-3">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </motion.span>
              
              {stat.trend !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.4, type: "spring" }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getTrendColor(stat.trend)}`}
                >
                  {getTrendIcon(stat.trend)}
                  {Math.abs(stat.trend)}%
                </motion.div>
              )}
            </div>

            {/* Subtitle */}
            {stat.subtitle && (
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            )}

            {/* Mini sparkline */}
            {stat.sparkline && (
              <div className="mt-4 h-8 flex items-end gap-1">
                {stat.sparkline.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ delay: idx * 0.1 + 0.5 + i * 0.05, duration: 0.5, ease: easeInOutCubic }}
                    className="flex-1 rounded-sm"
                    style={{
                      background: `linear-gradient(to top, ${stat.color}60, ${stat.color}20)`,
                      boxShadow: `0 0 8px ${stat.color}40`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom glow effect */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
              boxShadow: `0 0 20px ${stat.color}`
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}