import React from 'react';
import { motion } from 'framer-motion';

export function Card({ 
  children, 
  className = '', 
  gradient = false,
  gradientFrom = 'rgba(15, 23, 42, 0.8)',
  gradientTo = 'rgba(30, 41, 59, 0.9)',
  hover = true,
  onClick,
  delay = 0,
  ...props 
}) {
  const baseClasses = `
    rounded-xl border border-white/10 backdrop-blur-sm
    ${hover ? 'hover:border-white/20 transition-all duration-300' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const style = gradient 
    ? { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }
    : { background: 'rgba(30, 41, 59, 0.5)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={baseClasses}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <Card
      className={`backdrop-blur-xl bg-white/5 ${className}`}
      hover={false}
      {...props}
    >
      {children}
    </Card>
  );
}