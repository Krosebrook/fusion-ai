import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-white/10 p-4 shadow-2xl"
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
      </motion.div>
    );
  }
  return null;
};

export default function InteractiveChart({ data, title, dataKey = "value", color = "#FF7B00" }) {
  const [drilldownData, setDrilldownData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload;
      setSelectedPoint(point);
      
      // Simulate drill-down data
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        value: Math.floor(point.value / 24 + Math.random() * 100),
        sessions: Math.floor(Math.random() * 500) + 100
      }));
      setDrilldownData({ name: point.name, data: hourlyData });
    }
  };

  const closeDrilldown = () => {
    setDrilldownData(null);
    setSelectedPoint(null);
  };

  const gradientId = `gradient-${dataKey}-${Math.random()}`;

  return (
    <div className="relative">
      <motion.div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ZoomIn className="w-3 h-3" />
              Click any point to drill down
            </div>
          </div>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} onClick={handleChartClick} className="cursor-pointer">
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
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {drilldownData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={closeDrilldown}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="rounded-2xl border border-white/10 max-w-4xl w-full"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Hourly Breakdown: {drilldownData.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">24-hour detailed view</p>
                </div>
                <Button size="sm" variant="ghost" onClick={closeDrilldown}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={drilldownData.data}>
                    <defs>
                      <linearGradient id="drilldownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00B4D8"
                      strokeWidth={3}
                      fill="url(#drilldownGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}