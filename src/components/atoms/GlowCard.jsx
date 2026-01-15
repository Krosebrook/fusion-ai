import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FLASHFUSION_TOKENS } from "@/components/design-system/FlashFusionTokens";

/**
 * GlowCard - Card with neon glow effect on hover
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.glowColor - 'purple' | 'pink' | 'cyan'
 * @param {boolean} props.hover - Enable hover effect
 * @param {string} props.className - Additional classes
 */
export default function GlowCard({ 
  children, 
  glowColor = 'purple',
  hover = true,
  className,
  ...props 
}) {
  const glowColors = {
    purple: FLASHFUSION_TOKENS.shadows.neon.purple,
    pink: FLASHFUSION_TOKENS.shadows.neon.pink,
    cyan: FLASHFUSION_TOKENS.shadows.neon.cyan,
  };

  return (
    <motion.div
      className={cn(
        "p-6 rounded-xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm transition-all",
        hover && "cursor-pointer",
        className
      )}
      whileHover={hover ? {
        borderColor: glowColor === 'purple' ? '#8B5CF6' : glowColor === 'cyan' ? '#06B6D4' : '#EC4899',
        boxShadow: glowColors[glowColor],
        y: -4,
      } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}