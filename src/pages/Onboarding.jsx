/**
 * Onboarding Page
 * 
 * Entry point for new user onboarding flow with interactive tours,
 * tutorials, and guided first A/B test creation.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useUserPermissions } from '@/components/hooks/useUserPermissions';

export default function OnboardingPage() {
  const { user } = useUserPermissions();
  const queryClient = useQueryClient();
  const [completedSteps, setCompletedSteps] = useState([]);

  // Check if user has completed onboarding
  const { data: onboardingRecord } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: () =>
      user?.id
        ? base44.entities.UserOnboarding.filter({ user_id: user.id }).then(records => records[0])
        : Promise.resolve(null),
    enabled: !!user?.id,
  });

  // Mark onboarding as complete
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (onboardingRecord?.id) {
        return base44.entities.UserOnboarding.update(onboardingRecord.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      }
      return base44.entities.UserOnboarding.create({
        user_id: user.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_steps: completedSteps,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      // Redirect to dashboard after completion
      setTimeout(() => {
        window.location.href = '/app/Dashboard';
      }, 1500);
    },
  });

  const handleStepComplete = (stepId) => {
    setCompletedSteps(prev => [...new Set([...prev, stepId])]);
  };

  const handleOnboardingComplete = () => {
    completeOnboardingMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <OnboardingFlow
          user={user}
          completedSteps={completedSteps}
          onStepComplete={handleStepComplete}
          onComplete={handleOnboardingComplete}
          isCompleting={completeOnboardingMutation.isPending}
        />
      </div>
    </div>
  );
}