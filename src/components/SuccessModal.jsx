import { CheckCircle, Download, Sparkles, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Your creation is ready!",
  subtitle,
  stats,
  actions = [],
  nextSteps
}) {
  if (!isOpen) return null;

  const defaultActions = [
    { label: 'Download', icon: Download, primary: true, variant: 'primary' },
    { label: 'Generate Another', icon: Sparkles, variant: 'secondary' },
    { label: 'Share', icon: Share2, variant: 'ghost' }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-white" />
            </div>
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-40 animate-pulse" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {displayActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                onClick={action.onClick}
                className={`
                  flex-1 gap-2
                  ${action.primary || idx === 0
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    : action.variant === 'secondary'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-300'
                  }
                `}
              >
                {Icon && <Icon size={18} />}
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Next Steps */}
        {nextSteps && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              What's Next?
            </h3>
            <div className="text-sm text-gray-400 leading-relaxed">
              {nextSteps}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}