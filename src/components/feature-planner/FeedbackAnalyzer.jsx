import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2 } from "lucide-react";

export default function FeedbackAnalyzer({ quickWins }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-green-500/30 p-6 bg-green-500/10"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold text-white">Quick Wins</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4">High-impact features that can be implemented quickly</p>
      <ul className="space-y-2">
        {quickWins.map((win, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-2 text-sm text-gray-300"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            {win}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}