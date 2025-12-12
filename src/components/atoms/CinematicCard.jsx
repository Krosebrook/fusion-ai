/**
 * Cinematic Card - Atomic Component
 * Glassmorphic card with depth and lighting
 */

import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../design-system/tokens';
import { cn } from '@/lib/utils';

export function CinematicCard({
  children,
  variant = 'default',
  hover = true,
  glow = false,
  glowColor = 'orange',
  depth = 'md',
  blur = 'md',
  className,
  ...props
}) {
  const depths = {
    sm: tokens.shadows.sm,
    md: tokens.shadows.md,
    lg: tokens.shadows.lg,
    xl: tokens.shadows.xl,
  };

  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const glowColors = {
    orange: tokens.shadows.glow.orange,
    cyan: tokens.shadows.glow.cyan,
    magenta: tokens.shadows.glow.magenta,
    purple: tokens.shadows.glow.purple,
  };

  const variants = {
    default: 'bg-white/5 border-white/10',
    solid: 'bg-slate-800 border-slate-700',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border',
        'transition-all duration-300',
        blurs[blur],
        variants[variant],
        hover && 'hover:border-white/20',
        className
      )}
      style={{
        boxShadow: depths[depth],
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? {
        y: -4,
        boxShadow: glow ? glowColors[glowColor] : depths.xl,
        transition: { duration: 0.2, ease: tokens.easing.easeOut },
      } : {}}
      transition={{
        duration: 0.5,
        ease: tokens.easing.easeInOut,
      }}
      {...props}
    >
      {/* Inner glow */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}
      
      {children}

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

export default CinematicCard;