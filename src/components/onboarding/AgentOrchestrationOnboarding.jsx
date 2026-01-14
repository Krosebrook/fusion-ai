import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Check, Users, Target, MessageSquare } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function AgentOrchestrationOnboarding({ onComplete, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Agent Orchestration',
      description: 'Coordinate multiple AI agents to solve complex problems',
      icon: Users,
      gradient: 'from-cyan-500 to-blue-600',
      features: [
        'Define agent roles and responsibilities',
        'Set goals and capabilities per agent',
        'Configure communication protocols',
        'Build collaborative workflows'
      ]
    },
    {
      title: 'Create Your First Agent',
      description: 'Agents are specialized AI workers with specific skills',
      icon: Target,
      gradient: 'from-blue-500 to-purple-600',
      features: [
        'Name: What you call this agent',
        'Role: Its function (Researcher, Analyst, etc.)',
        'Goal: Primary objective to achieve',
        'Protocol: How it communicates with others'
      ]
    },
    {
      title: 'Build Workflows',
      description: 'Connect agents into collaborative pipelines',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Assign agents to workflow steps',
        'Enable task delegation between agents',
        'Set consensus rules for decisions',
        'Define escalation paths for issues'
      ]
    }
  ];

  const handleComplete = async () => {
    try {
      const user = await base44.auth.me();
      const modules = user.onboarding_completed_modules || [];
      await base44.auth.updateMe({ 
        onboarding_completed_modules: [...modules, 'agent_orchestration'] 
      });
      toast.success('Ready to orchestrate agents!');
      onComplete?.();
    } catch (error) {
      toast.error('Failed to save progress');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <CinematicCard className="p-8 relative">
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[currentStep].gradient} flex items-center justify-center shadow-2xl`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-white/60">{steps[currentStep].description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {steps[currentStep].features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${steps[currentStep].gradient}`}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="border-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  {currentStep === steps.length - 1 ? (
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Start Building
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className={`bg-gradient-to-r ${steps[currentStep].gradient}`}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </CinematicCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}