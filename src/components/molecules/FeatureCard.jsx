import React from "react";
import { motion } from "framer-motion";
import GlowCard from "@/components/atoms/GlowCard";
import { cn } from "@/lib/utils";

/**
 * FeatureCard - Feature showcase with icon and description
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description
 * @param {string} props.gradient - Icon gradient color
 */
export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  gradient = "from-purple-500 to-cyan-500",
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <GlowCard glowColor="purple">
        <div className={cn(
          "w-12 h-12 rounded-xl mb-4 flex items-center justify-center",
          "bg-gradient-to-br",
          gradient
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </GlowCard>
    </motion.div>
  );
}