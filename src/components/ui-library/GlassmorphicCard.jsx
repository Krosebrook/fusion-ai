import { motion } from 'framer-motion';

export function GlassmorphicCard({ 
  children, 
  className = '',
  blur = 'md',
  gradient = true,
  hover = true,
  delay = 0,
  ...props 
}) {
  const blurLevels = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' }
      } : {}}
      className={`
        rounded-2xl border border-white/10
        ${blurLevels[blur]}
        ${gradient ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-white/5'}
        ${hover ? 'hover:border-white/20 hover:shadow-2xl hover:shadow-orange-500/10' : ''}
        transition-all duration-300
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}