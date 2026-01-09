import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function FormField({ 
  label,
  error,
  type = 'text',
  required = false,
  multiline = false,
  icon: Icon,
  className = '',
  ...props 
}) {
  const Component = multiline ? Textarea : Input;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {label}
          {required && <span className="text-red-400">*</span>}
        </Label>
      )}
      
      <Component
        className={`
          bg-white/5 border-white/10 text-white
          focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20
          transition-all duration-200
          ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        {...props}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}