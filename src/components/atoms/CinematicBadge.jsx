/**
 * Cinematic Badge - Atomic Component
 * Stylized badge with glow effects
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-slate-700 text-slate-200',
  primary: 'bg-gradient-to-r from-orange-500 to-pink-600 text-white',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  neon: 'bg-purple-500/20 text-purple-300 border border-purple-500/50',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function CinematicBadge({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  pulse = false,
  className,
  ...props
}) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-semibold rounded-full',
        'backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...(pulse && {
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }),
      }}
      whileHover={glow ? {
        boxShadow: '0 0 20px currentColor',
      } : {}}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </motion.span>
  );
}

export default CinematicBadge;