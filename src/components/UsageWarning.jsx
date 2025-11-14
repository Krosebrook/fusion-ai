import { AlertTriangle, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UsageWarning({ current, limit, onUpgrade, onRefer }) {
  const percentage = (current / limit) * 100;
  const remaining = limit - current;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining <= 0;

  if (!isNearLimit && !isAtLimit) return null;

  return (
    <div className={`
      fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full mx-4
      animate-in slide-in-from-top duration-500
    `}>
      <div className={`
        rounded-xl shadow-2xl p-4 border-2
        ${isAtLimit 
          ? 'bg-gradient-to-r from-red-900/90 to-orange-900/90 border-red-500'
          : 'bg-gradient-to-r from-orange-900/90 to-yellow-900/90 border-orange-500'
        }
        backdrop-blur-xl
      `}>
        <div className="flex items-start gap-4">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${isAtLimit ? 'bg-red-500' : 'bg-orange-500'}
          `}>
            <AlertTriangle size={24} className="text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">
              {isAtLimit 
                ? '🚫 Generation Limit Reached'
                : `⚠️ ${remaining} Generation${remaining === 1 ? '' : 's'} Remaining`
              }
            </h3>
            <p className="text-sm text-gray-200 mb-3">
              {isAtLimit 
                ? `You've used all ${limit} free generations this month. Upgrade to Pro for unlimited access!`
                : `You've used ${current} of ${limit} free generations. Upgrade now to avoid interruption!`
              }
            </p>

            <div className="flex flex-wrap gap-2">
              <Link to={createPageUrl("Home") + "#pricing"}>
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold gap-2"
                >
                  Get 50% OFF Pro
                  <ArrowRight size={14} />
                </Button>
              </Link>

              {onRefer && (
                <Button
                  onClick={onRefer}
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                >
                  <Users size={14} />
                  Invite Friends for +10 Free
                </Button>
              )}
            </div>
          </div>

          <button
            onClick={() => {/* dismiss */}}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {!isAtLimit && (
          <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white to-yellow-200 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}