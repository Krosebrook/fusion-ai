import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-orange-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} className="bg-gradient-to-r from-orange-500 to-pink-500">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}