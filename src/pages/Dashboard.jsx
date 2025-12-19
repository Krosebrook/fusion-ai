/**
 * Personalized Dashboard
 * Adaptive hub with customizable widgets and AI-driven insights
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { LoadingScreen } from '@/components/ui-library';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { WidgetSystem } from '@/components/dashboard/WidgetSystem';
import { PersonalizedInsights } from '@/components/dashboard/widgets/PersonalizedInsights';
import { QuickActionsWidget } from '@/components/dashboard/widgets/QuickActionsWidget';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { RecommendationsWidget } from '@/components/dashboard/widgets/RecommendationsWidget';
import { onboardingService } from '@/components/services/OnboardingService';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      if (user) {
        const onboarding = await onboardingService.getOrCreateOnboarding(user.id);
        setShowOnboarding(onboarding.status === 'not_started');
      }
    } catch (error) {
      console.error('Failed to check onboarding status', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const availableWidgets = [
    {
      id: 'stats',
      name: 'Statistics',
      component: StatsWidget,
    },
    {
      id: 'insights',
      name: 'Insights',
      component: PersonalizedInsights,
    },
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      component: QuickActionsWidget,
    },
    {
      id: 'recent-activity',
      name: 'Recent Activity',
      component: RecentActivityWidget,
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      component: RecommendationsWidget,
    },
  ];

  if (checkingOnboarding) return <LoadingScreen message="Personalizing your experience..." />;

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Cinematic Welcome Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            >
              <Sparkles className="w-10 h-10 text-orange-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-lg md:text-xl text-white/70">
                Your personalized AI workspace, tailored just for you
              </p>
            </div>
          </div>
        </motion.div>

        {/* Customizable Widget System */}
        <WidgetSystem 
          user={user} 
          availableWidgets={availableWidgets}
          onLayoutChange={(layout) => {
            console.log('Dashboard layout updated', layout);
          }}
        />
      </div>
    </div>
  );
}