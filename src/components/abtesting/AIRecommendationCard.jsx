/**
 * AI Recommendation Card Component
 * 
 * Display and apply AI-generated recommendations for A/B tests.
 */
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const ACTION_COLORS = {
  continue_test: 'from-blue-500 to-cyan-500',
  increase_winning_variant: 'from-green-500 to-emerald-500',
  stop_losing_variant: 'from-orange-500 to-red-500',
  declare_winner: 'from-purple-500 to-pink-500',
  collect_more_data: 'from-yellow-500 to-orange-500',
};

const ACTION_ICONS = {
  continue_test: AlertCircle,
  increase_winning_variant: Zap,
  stop_losing_variant: AlertCircle,
  declare_winner: CheckCircle2,
  collect_more_data: AlertCircle,
};

export function AIRecommendationCard({ recommendation, onApply, applied }) {
  const Icon = ACTION_ICONS[recommendation.action];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border-l-4 bg-gradient-to-r ${ACTION_COLORS[recommendation.action]} bg-opacity-10 border-l-${ACTION_COLORS[recommendation.action].split(' ')[1]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-white" />
        
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1 capitalize">
            {recommendation.action.replace(/_/g, ' ')}
          </h4>
          <p className="text-white/70 text-sm mb-3">{recommendation.reasoning}</p>

          {recommendation.new_traffic_split && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
              <p className="text-white/60 text-xs mb-2">Suggested Traffic Split</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white/70 text-xs">Variant A</p>
                  <p className="text-white font-bold">
                    {recommendation.new_traffic_split.variant_a_percentage}%
                  </p>
                </div>
                <div className="text-white/40">→</div>
                <div>
                  <p className="text-white/70 text-xs">Variant B</p>
                  <p className="text-white font-bold">
                    {recommendation.new_traffic_split.variant_b_percentage}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Confidence:</span>
              <span className={`text-xs font-semibold ${
                recommendation.confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {(recommendation.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {!applied && (
              <Button
                onClick={onApply}
                size="sm"
                className="ml-auto bg-white/20 hover:bg-white/30 text-white"
              >
                Apply
              </Button>
            )}

            {applied && (
              <div className="ml-auto flex items-center gap-1 text-green-400 text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Applied
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}