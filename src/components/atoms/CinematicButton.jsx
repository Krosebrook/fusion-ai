/**
 * Cinematic Button - Atomic Component
 * Motion-enabled button with studio-grade interactions
 */

import { motion } from 'framer-motion';
import { tokens } from '../design-system/tokens';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary: {
    base: 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-[0_4px_20px_rgba(255,123,0,0.3)]',
    hover: 'from-orange-600 to-pink-700',
    glow: '0 6px 32px rgba(255,123,0,0.5)',
  },
  glass: {
    base: 'bg-white/[0.10] border border-white/[0.22] text-white/90 backdrop-blur-[12px]',
    hover: 'bg-white/[0.14] border-white/[0.35]',
    glow: 'none',
  },
  secondary: {
    base: 'bg-white/5 border border-white/10 text-white backdrop-blur-md',
    hover: 'bg-white/10 border-white/20',
    glow: 'none',
  },
  outline: {
    base: 'border-2 border-orange-500 text-orange-500 bg-transparent',
    hover: 'bg-orange-500/10',
    glow: 'none',
  },
  ghost: {
    base: 'bg-transparent text-white hover:bg-white/5',
    hover: 'bg-white/10',
    glow: 'none',
  },
  danger: {
    base: 'bg-red-500 text-white',
    hover: 'bg-red-600',
    glow: '0 0 20px rgba(239, 68, 68, 0.4)',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export function CinematicButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  glow = false,
  onClick,
  className,
  ...props
}) {
  const variantStyles = variants[variant] || variants.primary;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-semibold rounded-xl',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles.base,
        sizes[size],
        className
      )}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        boxShadow: glow ? variantStyles.glow : 'none',
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: tokens.easing.smooth,
      }}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      
      <span>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}

      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'linear' }}
      >
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </motion.div>
    </motion.button>
  );
}

export default CinematicButton;