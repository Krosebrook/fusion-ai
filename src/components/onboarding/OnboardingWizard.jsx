/**
 * Onboarding Wizard
 * Main orchestrator for the investor profile setup flow
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { DealSourcingStep } from './DealSourcingStep';
import { PortfolioGoalsStep } from './PortfolioGoalsStep';
import { CommunityPreferencesStep } from './CommunityPreferencesStep';
import { ReviewStep } from './ReviewStep';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Investment Journey',
    subtitle: 'Let\'s personalize your experience',
    component: null, // Custom welcome
    required: false
  },
  {
    id: 'deal_sourcing',
    title: 'Deal Sourcing Preferences',
    subtitle: 'Define where you want to invest',
    component: DealSourcingStep,
    required: true
  },
  {
    id: 'portfolio_goals',
    title: 'Portfolio Goals',
    subtitle: 'Set your financial targets',
    component: PortfolioGoalsStep,
    required: true
  },
  {
    id: 'community',
    title: 'Community Preferences',
    subtitle: 'Connect with like-minded investors',
    component: CommunityPreferencesStep,
    required: false
  },
  {
    id: 'review',
    title: 'Review Your Profile',
    subtitle: 'Confirm your preferences',
    component: ReviewStep,
    required: false
  }
];

export function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    deal_sourcing: {},
    portfolio_goals: {},
    community_preferences: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleStepChange = (stepId, data) => {
    setProfileData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
  };

  const canProceed = () => {
    const currentStepObj = STEPS[currentStep];
    if (!currentStepObj.required) return true;

    const data = profileData[currentStepObj.id] || {};
    
    if (currentStepObj.id === 'deal_sourcing') {
      return data.target_industries?.length > 0 && 
             data.risk_tolerance &&
             data.investment_range?.min_usd &&
             data.investment_range?.max_usd &&
             data.investment_range.min_usd < data.investment_range.max_usd;
    }
    
    if (currentStepObj.id === 'portfolio_goals') {
      return data.time_horizon && data.target_annual_return;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create/update investor profile
      const investorProfile = {
        user_id: user.id,
        deal_sourcing: profileData.deal_sourcing,
        portfolio_goals: profileData.portfolio_goals,
        community_preferences: profileData.community_preferences,
        onboarding_status: 'completed',
        profile_completeness: calculateCompleteness(profileData),
        last_updated: new Date().toISOString()
      };

      // Check if profile exists
      const existing = await base44.entities.InvestorProfile.filter({ user_id: user.id });
      
      if (existing.length > 0) {
        await base44.entities.InvestorProfile.update(existing[0].id, investorProfile);
      } else {
        await base44.entities.InvestorProfile.create(investorProfile);
      }

      onComplete?.(investorProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const step = STEPS[currentStep];
  const StepComponent = step.component;
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">BuildBuddy</h1>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-white">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-white/60">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.4, 0, 0.2, 1] // Cubic bezier for cinema-grade easing
            }}
          >
            <CinematicCard className="p-8 mb-8">
              {/* Step Title */}
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-white/60 mb-8">{step.subtitle}</p>

              {/* Welcome Step */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <p className="text-white/80 leading-relaxed">
                    Welcome! We're excited to have you join our investment community. Over the next few minutes, we'll gather your preferences to personalize your dashboard, curate deal recommendations, and connect you with the right peers.
                  </p>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 space-y-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <h4 className="font-semibold text-white">Personalized Deal Flow</h4>
                        <p className="text-sm text-white/60">Get opportunities tailored to your criteria</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-2xl">👥</div>
                      <div>
                        <h4 className="font-semibold text-white">Smart Networking</h4>
                        <p className="text-sm text-white/60">Connect with investors like you</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <h4 className="font-semibold text-white">Portfolio Insights</h4>
                        <p className="text-sm text-white/60">Track performance against your goals</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 italic">Takes ~5 minutes. Skip optional steps anytime.</p>
                </div>
              )}

              {/* Regular Steps */}
              {StepComponent && step.id !== 'review' && (
                <StepComponent
                  data={profileData[step.id] || {}}
                  onChange={(data) => handleStepChange(step.id, data)}
                />
              )}

              {/* Review Step - Pass Full Profile */}
              {step.id === 'review' && (
                <ReviewStep data={profileData} />
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-4 mt-8 pt-8 border-t border-white/10">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === STEPS.length - 1 ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading || !canProceed()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Complete Setup ✨</>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {canProceed() ? 'Next' : 'Complete Required Fields'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CinematicCard>
          </motion.div>
        </AnimatePresence>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mt-8"
        >
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i <= currentStep ? 'bg-purple-500 w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function calculateCompleteness(profileData) {
  let filled = 0;
  let total = 0;

  // Deal sourcing: 5 fields
  const dealSourcing = profileData.deal_sourcing || {};
  total += 5;
  if (dealSourcing.target_industries?.length > 0) filled++;
  if (dealSourcing.investment_range?.min_usd && dealSourcing.investment_range?.max_usd) filled++;
  if (dealSourcing.preferred_structures?.length > 0) filled++;
  if (dealSourcing.geography?.length > 0) filled++;
  if (dealSourcing.risk_tolerance) filled++;

  // Portfolio goals: 3 fields
  const portfolio = profileData.portfolio_goals || {};
  total += 3;
  if (portfolio.time_horizon) filled++;
  if (portfolio.target_annual_return) filled++;
  if (portfolio.diversification_preference) filled++;

  // Community: 2 fields
  const community = profileData.community_preferences || {};
  total += 2;
  if (community.engagement_mode) filled++;
  if (community.notification_frequency) filled++;

  return Math.round((filled / total) * 100);
}

export default OnboardingWizard;