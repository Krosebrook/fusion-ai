/**
 * Cinematic Card - Atomic Component
 * Glassmorphic card with depth and lighting
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CinematicCard({
  children,
  variant = 'glass',
  hover = true,
  glow = false,
  glowColor = 'orange',
  className,
  ...props
}) {
  const glowColors = {
    orange: '0 0 40px rgba(255,123,0,0.4)',
    cyan: '0 0 40px rgba(36,255,215,0.4)',
    magenta: '0 0 40px rgba(255,59,212,0.4)',
    purple: '0 0 40px rgba(138,92,255,0.4)',
  };

  const variants = {
    glass: 'bg-gradient-to-b from-white/[0.10] to-white/[0.07] border-white/[0.18]',
    solid: 'bg-slate-800/90 border-slate-700/50',
    minimal: 'bg-white/[0.05] border-white/[0.12]',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-[18px] border overflow-hidden',
        'backdrop-blur-[18px] backdrop-saturate-[1.3]',
        'shadow-[0_18px_55px_rgba(0,0,0,0.45)]',
        'transition-all duration-300',
        variants[variant],
        hover && 'hover:border-white/[0.30]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? {
        y: -4,
        boxShadow: glow ? glowColors[glowColor] : '0 22px 65px rgba(0,0,0,0.50)',
      } : {}}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      {...props}
    >
      {/* Inner glass highlight */}
      <div 
        className="absolute -top-1/2 -left-1/4 h-[140%] w-[140%] rotate-[-12deg] opacity-55 pointer-events-none"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent 70%)',
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default CinematicCard;