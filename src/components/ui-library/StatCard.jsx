import { motion } from 'framer-motion';

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = '#FF7B00',
  change,
  delay = 0,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-xl border border-white/10 p-6 backdrop-blur-sm ${className}`}
      style={{ 
        background: `linear-gradient(135deg, ${color}08 0%, rgba(30, 41, 59, 0.9) 100%)` 
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{label}</p>
        {Icon && (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
        </p>
      )}
    </motion.div>
  );
}