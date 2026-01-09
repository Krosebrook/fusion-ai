import { useRef } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 p-4 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400">{entry.name}</span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CinematicChart({ 
  data, 
  type = "area", 
  title, 
  subtitle,
  value,
  change,
  dataKey = "value",
  color = "#FF7B00",
  height = 300
}) {
  const chartRef = useRef(null);

  const gradientId = `gradient-${dataKey}-${Math.random()}`;
  const changePercent = parseFloat(change);
  const isPositive = changePercent >= 0;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6, fill: color, stroke: "rgba(255,255,255,0.5)", strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
      ref={chartRef}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-bold">{change}</span>
            </div>
          )}
        </div>
        {value && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: easeInOutCubic }}
            className="mt-4"
          >
            <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {value}
            </span>
          </motion.div>
        )}
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}