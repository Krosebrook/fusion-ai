import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', color = '#FF7B00', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center ${className}`}
    >
      <Loader2 
        className={`${sizes[size]} animate-spin`}
        style={{ color }}
      />
    </motion.div>
  );
}

export function LoadingSkeleton({ className = '', width = '100%', height = '20px' }) {
  return (
    <div
      className={`bg-white/5 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="text-gray-400 mt-4">{message}</p>
      </div>
    </div>
  );
}