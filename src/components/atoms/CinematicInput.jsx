/**
 * Cinematic Input - Atomic Component
 * Studio-grade input with focus effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../design-system/tokens';
import { cn } from '@/lib/utils';

export function CinematicInput({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  className,
  ...props
}) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <motion.input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-white placeholder-slate-500',
            'backdrop-blur-md',
            'transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            Icon && iconPosition === 'left' && 'pl-12',
            Icon && iconPosition === 'right' && 'pr-12',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: tokens.easing.easeOut,
          }}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Focus glow */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              boxShadow: tokens.shadows.glow.orange,
            }}
          />
        )}
      </div>

      {(hint || error) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-2 text-sm',
            error ? 'text-red-400' : 'text-slate-400'
          )}
        >
          {error || hint}
        </motion.p>
      )}
    </div>
  );
}

export default CinematicInput;