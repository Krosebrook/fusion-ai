import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-500/30',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-500/20',
  success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl shadow-green-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
};

export function CinemaButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17 
      }}
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-xl font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        transition-all duration-300
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}