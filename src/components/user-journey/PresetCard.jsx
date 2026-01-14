import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { USER_ROLES } from './constants';

export function PresetCard({ presetKey, preset, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(presetKey)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`p-4 rounded-lg border text-left transition-all ${
        isSelected
          ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
          : 'bg-slate-800/30 border-white/10 hover:border-purple-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{preset.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
            {preset.name}
          </h3>
          <p className="text-white/60 text-xs mb-2 line-clamp-2">
            {preset.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge className="text-xs bg-slate-700/50 border-white/10">
              {USER_ROLES[preset.role].label}
            </Badge>
            {isSelected && (
              <CheckCircle className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}