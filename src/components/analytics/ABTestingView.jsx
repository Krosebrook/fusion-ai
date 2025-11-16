import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Flame, TrendingUp, Users } from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const tests = [
  {
    name: "Homepage CTA Button",
    variantA: { name: "Blue Button", conversions: 245, visitors: 1200, rate: 20.4 },
    variantB: { name: "Orange Button", conversions: 312, visitors: 1200, rate: 26.0 },
    winner: "B",
    improvement: "+27.5%",
    status: "completed"
  },
  {
    name: "Pricing Page Layout",
    variantA: { name: "Grid Layout", conversions: 89, visitors: 580, rate: 15.3 },
    variantB: { name: "List Layout", conversions: 76, visitors: 580, rate: 13.1 },
    winner: "A",
    improvement: "+16.8%",
    status: "completed"
  },
  {
    name: "Email Subject Line",
    variantA: { name: "Question Format", conversions: 156, visitors: 2400, rate: 6.5 },
    variantB: { name: "Statement Format", conversions: 168, visitors: 2400, rate: 7.0 },
    winner: "B",
    improvement: "+7.7%",
    status: "running"
  }
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 p-4 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        {payload.map((entry, idx) => (
          <div key={idx} className="mb-2">
            <p className="text-xs text-gray-400">{entry.name}</p>
            <p className="text-lg font-bold" style={{ color: entry.color }}>
              {entry.value.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ABTestingView() {
  const chartData = tests.map(test => ({
    name: test.name,
    [test.variantA.name]: test.variantA.rate,
    [test.variantB.name]: test.variantB.rate
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              A/B Testing Results
            </h3>
            <p className="text-xs text-gray-400">{tests.filter(t => t.status === 'running').length} active tests</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" style={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
            <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            <Bar dataKey={tests[0].variantA.name} fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            <Bar dataKey={tests[0].variantB.name} fill="#00B4D8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 border-t border-white/10 space-y-4">
        {tests.map((test, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{test.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    test.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {test.status}
                  </span>
                  {test.winner && (
                    <span className="text-xs text-gray-400">
                      Winner: <span className="text-orange-400 font-bold">Variant {test.winner}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-sm font-bold">{test.improvement}</span>
                </div>
                <span className="text-xs text-gray-400">improvement</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${test.winner === 'A' ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}>
                <p className="text-xs text-gray-400 mb-1">{test.variantA.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">{test.variantA.rate}%</span>
                  <span className="text-xs text-gray-400">{test.variantA.conversions}/{test.variantA.visitors}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${test.winner === 'B' ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}>
                <p className="text-xs text-gray-400 mb-1">{test.variantB.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">{test.variantB.rate}%</span>
                  <span className="text-xs text-gray-400">{test.variantB.conversions}/{test.variantB.visitors}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}