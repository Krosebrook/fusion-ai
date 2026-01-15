import React from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/atoms/AnimatedCounter";
import { Card } from "@/components/ui/card";

/**
 * StatCard - Displays animated statistic with icon
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number} props.value - Stat value
 * @param {string} props.suffix - Value suffix ('+', '%', etc.)
 * @param {React.ComponentType} props.icon - Lucide icon
 * @param {string} props.iconColor - Icon color class
 */
export default function StatCard({ 
  label, 
  value, 
  suffix = "",
  icon: Icon,
  iconColor = "text-purple-400",
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-2">{label}</p>
            <AnimatedCounter 
              value={value} 
              suffix={suffix}
              className="text-3xl font-bold text-white"
            />
          </div>
          {Icon && <Icon className={cn("w-10 h-10", iconColor)} />}
        </div>
      </Card>
    </motion.div>
  );
}