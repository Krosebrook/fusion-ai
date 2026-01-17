/**
 * Widget Palette Component
 * 
 * Palette of available widgets for dashboard customization.
 */
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { TrendingUp, Users, BarChart3, Target, Clock, Zap, DollarSign, Percent } from 'lucide-react';

const AVAILABLE_WIDGETS = [
  {
    id: 'conversion_funnel',
    name: 'Conversion Funnel',
    description: 'Track user progression through conversion stages',
    icon: Percent,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'user_segmentation',
    name: 'User Segmentation',
    description: 'Analyze user groups and cohorts',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'roi_tracking',
    name: 'ROI Tracking',
    description: 'Monitor return on investment metrics',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'variant_performance',
    name: 'Variant Performance',
    description: 'Compare A/B test variant metrics',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'test_timeline',
    name: 'Test Timeline',
    description: 'View test progression over time',
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'statistical_summary',
    name: 'Statistical Summary',
    description: 'Display statistical significance metrics',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'traffic_distribution',
    name: 'Traffic Distribution',
    description: 'Monitor traffic split between variants',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'revenue_impact',
    name: 'Revenue Impact',
    description: 'Track revenue changes from tests',
    icon: Target,
    color: 'from-pink-500 to-rose-500',
  },
];

export function WidgetPalette({ onSelectWidget, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
    >
      <CinematicCard className="w-full max-w-2xl p-8" glow glowColor="cyan">
        <h2 className="text-2xl font-bold text-white mb-6">Available Widgets</h2>
        
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {AVAILABLE_WIDGETS.map((widget, idx) => {
            const Icon = widget.icon;
            return (
              <motion.button
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectWidget(widget.id)}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-left"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white text-sm">{widget.name}</h3>
                <p className="text-white/60 text-xs mt-1">{widget.description}</p>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          ✕
        </button>
      </CinematicCard>
    </motion.div>
  );
}