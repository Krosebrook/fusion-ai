import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Check, GitBranch, GitMerge, AlertCircle } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';

export function ChainBuilderOnboarding({ onComplete, onDismiss }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Multi-Step Workflows',
      icon: GitBranch,
      gradient: 'from-purple-500 to-pink-600',
      content: 'Chain Builder lets you create complex workflows by connecting multiple prompts together. Each node can transform, validate, or route data to the next step.'
    },
    {
      title: 'Node Types',
      icon: GitMerge,
      gradient: 'from-cyan-500 to-blue-600',
      content: 'Use different node types: Prompt (AI execution), Condition (if/else logic), Parallel (run multiple steps simultaneously), Transform (modify data), Function (call backend), Loop (iterate over arrays).'
    },
    {
      title: 'Error Handling',
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-600',
      content: 'Configure what happens on errors: Stop (halt execution), Continue (skip failed node), Retry (attempt again), Fallback (use backup node). Set retry counts and timeouts per node.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <CinematicCard className="p-6 relative">
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-white/60"
          >
            <X className="w-4 h-4" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(() => {
                const Icon = steps[step].icon;
                return (
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[step].gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{steps[step].title}</h3>
                  </div>
                );
              })()}

              <p className="text-white/70 mb-6 leading-relaxed">{steps[step].content}</p>

              <div className="h-1 bg-slate-800 rounded-full mb-4">
                <motion.div
                  className={`h-full bg-gradient-to-r ${steps[step].gradient} rounded-full`}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-end gap-2">
                {step === steps.length - 1 ? (
                  <Button
                    onClick={onComplete}
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Got It
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className={`bg-gradient-to-r ${steps[step].gradient}`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}