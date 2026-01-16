/**
 * Onboarding Flow Component
 * 
 * Main orchestrator for the onboarding experience.
 * Guides users through dashboard tour, tutorials, and first A/B test.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { DashboardTour } from './DashboardTour';
import { AnalyticsFeatureTutorial } from './AnalyticsFeatureTutorial';
import { FirstABTestGuide } from './FirstABTestGuide';
import { RBACPermissionsGuide } from './RBACPermissionsGuide';
import { ChevronRight, CheckCircle2, Rocket } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to FlashFusion',
    description: 'Let\'s get you set up for success',
    component: null,
  },
  {
    id: 'dashboard-tour',
    title: 'Dashboard Tour',
    description: 'Explore the Advanced Analytics dashboard',
    component: DashboardTour,
  },
  {
    id: 'analytics-tutorial',
    title: 'Analytics Features',
    description: 'Learn trend analysis, cohorts, and significance testing',
    component: AnalyticsFeatureTutorial,
  },
  {
    id: 'rbac-guide',
    title: 'Roles & Permissions',
    description: 'Understand the RBAC system and user roles',
    component: RBACPermissionsGuide,
  },
  {
    id: 'first-test',
    title: 'Create Your First Test',
    description: 'Set up your first A/B test',
    component: FirstABTestGuide,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Ready to start testing',
    component: null,
  },
];

export function OnboardingFlow({
  user,
  completedSteps,
  onStepComplete,
  onComplete,
  isCompleting,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    onStepComplete(currentStep.id);
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto w-full mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-cyan-400" />
              Getting Started
            </h1>
            <p className="text-white/60 mt-1">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </p>
          </div>
          {completedSteps.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-cyan-400">{completedSteps.length}</div>
              <div className="text-white/60 text-sm">Completed</div>
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {ONBOARDING_STEPS.map((step, idx) => (
            <motion.button
              key={step.id}
              onClick={() => idx <= currentStepIndex && setCurrentStepIndex(idx)}
              disabled={idx > currentStepIndex}
              className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                idx > currentStepIndex ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              whileHover={idx <= currentStepIndex ? { scale: 1.05 } : {}}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  idx < currentStepIndex
                    ? 'bg-cyan-500 text-white'
                    : idx === currentStepIndex
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-white/40'
                }`}
              >
                {idx < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className="text-xs text-white/60 max-w-16 text-center truncate hidden sm:block">
                {step.title}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {currentStep.id === 'welcome' ? (
              <WelcomeStep user={user} />
            ) : currentStep.id === 'complete' ? (
              <CompleteStep />
            ) : currentStep.component ? (
              <currentStep.component onComplete={handleNext} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto w-full mt-12 flex items-center justify-between"
      >
        <Button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || isCompleting}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/5"
        >
          Previous
        </Button>

        <Button
          onClick={handleSkip}
          variant="ghost"
          disabled={isCompleting}
          className="text-white/60 hover:text-white"
        >
          Skip
        </Button>

        <Button
          onClick={handleNext}
          disabled={isCompleting}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2"
        >
          {currentStepIndex === ONBOARDING_STEPS.length - 1
            ? isCompleting
              ? 'Finishing...'
              : 'Finish'
            : 'Next'}
          {currentStepIndex < ONBOARDING_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </motion.div>
    </div>
  );
}

/**
 * Welcome Step
 */
function WelcomeStep({ user }) {
  return (
    <CinematicCard className="p-12 text-center" glow glowColor="cyan">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg"
      >
        <Rocket className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome, {user?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
          We're excited to show you how to master A/B testing with FlashFusion's advanced analytics and role-based access control.
        </p>
        <p className="text-white/60">
          This guided tour will take about 10 minutes. You can skip any time.
        </p>
      </motion.div>
    </CinematicCard>
  );
}

/**
 * Complete Step
 */
function CompleteStep() {
  return (
    <CinematicCard className="p-12 text-center" glow glowColor="cyan">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
      >
        <CheckCircle2 className="w-14 h-14 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-white mb-4">You're All Set!</h1>
        <p className="text-xl text-white/80 mb-2">
          You've completed your onboarding and are ready to start testing.
        </p>
        <p className="text-white/60 mb-8">
          You'll be redirected to the dashboard in a moment...
        </p>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block"
      >
        <div className="w-3 h-3 rounded-full bg-cyan-500 mx-1 inline-block" />
        <div className="w-3 h-3 rounded-full bg-cyan-500 mx-1 inline-block" />
        <div className="w-3 h-3 rounded-full bg-cyan-500 mx-1 inline-block" />
      </motion.div>
    </CinematicCard>
  );
}