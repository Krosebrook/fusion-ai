/**
 * Onboarding Wizard
 * Cinematic, AI-personalized onboarding experience
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Code,
  Palette,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { onboardingService } from '../services/OnboardingService';
import { useAuth } from '../hooks/useAuth';
import { tokens } from '../design-system/tokens';

const USER_TYPES = [
  { id: 'developer', label: 'Developer', icon: Code, description: 'Build apps and automate workflows' },
  { id: 'content_creator', label: 'Content Creator', icon: Palette, description: 'Create engaging content and visuals' },
  { id: 'business_user', label: 'Business User', icon: Briefcase, description: 'Automate processes and gain insights' },
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Learn and experiment with AI' },
];

const INTERESTS = [
  { id: 'code_generation', label: 'Code Generation' },
  { id: 'content_creation', label: 'Content Creation' },
  { id: 'ai_agents', label: 'AI Agents & Automation' },
  { id: 'image_generation', label: 'Image Generation' },
  { id: 'prompt_engineering', label: 'Prompt Engineering' },
  { id: 'analytics', label: 'Analytics & Insights' },
  { id: 'cicd', label: 'CI/CD & Deployment' },
];

export function OnboardingWizard({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    userType: '',
    interests: [],
    experience: 'beginner',
  });

  const totalSteps = 4;

  const handleNext = async () => {
    if (step === 2) {
      await generateRecommendations();
    }
    
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      const personalizedProfile = await onboardingService.analyzeUserIntent({
        role: formData.userType,
        goals: formData.interests,
        experience: formData.experience,
      });

      setProfile(personalizedProfile);
      
      if (user) {
        await onboardingService.refinePersonalization(user.id);
      }

      toast.success('Personalized experience ready!');
    } catch (error) {
      toast.error('Failed to personalize experience');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      if (user) {
        await onboardingService.completeOnboarding(user.id);
      }
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding', error);
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return formData.userType !== '';
      case 2:
        return formData.interests.length > 0;
      case 3:
        return profile !== null;
      default:
        return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex items-center justify-center p-6 overflow-auto"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        className="w-full max-w-4xl relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: tokens.easing.smooth }}
      >
        <CinematicCard className="overflow-hidden">
          <div className="h-1 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepContainer key="welcome">
                  <motion.div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 mb-6"
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                      Welcome to FlashFusion
                    </h1>
                    
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                      Let's personalize your experience in just a few steps. We'll tailor FlashFusion to match your unique needs and goals.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      {[
                        { icon: Zap, label: 'AI-Powered', desc: 'Intelligent automation' },
                        { icon: Code, label: 'Production Ready', desc: 'Enterprise-grade tools' },
                        { icon: Sparkles, label: 'Personalized', desc: 'Tailored to you' },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <item.icon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <p className="text-white font-medium text-sm">{item.label}</p>
                          <p className="text-slate-400 text-xs">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </StepContainer>
              )}

              {step === 1 && (
                <StepContainer key="usertype">
                  <h2 className="text-3xl font-bold text-white mb-3 text-center">
                    What best describes you?
                  </h2>
                  <p className="text-slate-400 text-center mb-8">
                    This helps us recommend the right features for you
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {USER_TYPES.map((type, i) => {
                      const Icon = type.icon;
                      const isSelected = formData.userType === type.id;
                      
                      return (
                        <motion.button
                          key={type.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => setFormData({ ...formData, userType: type.id })}
                          className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-orange-500' : 'text-white'}`} />
                          <h3 className="text-white font-semibold text-lg mb-1">{type.label}</h3>
                          <p className="text-slate-400 text-sm">{type.description}</p>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </StepContainer>
              )}

              {step === 2 && (
                <StepContainer key="interests">
                  <h2 className="text-3xl font-bold text-white mb-3 text-center">
                    What are you interested in?
                  </h2>
                  <p className="text-slate-400 text-center mb-8">
                    Select all that apply - we'll prioritize these features
                  </p>

                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {INTERESTS.map((interest, i) => {
                        const isSelected = formData.interests.includes(interest.id);
                        
                        return (
                          <motion.button
                            key={interest.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => {
                              const newInterests = isSelected
                                ? formData.interests.filter(int => int !== interest.id)
                                : [...formData.interests, interest.id];
                              setFormData({ ...formData, interests: newInterests });
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-orange-500 border-orange-500' : 'border-white/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-white font-medium">{interest.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">Experience Level</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => setFormData({ ...formData, experience: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner - Just getting started</SelectItem>
                          <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                          <SelectItem value="advanced">Advanced - Expert user</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </StepContainer>
              )}

              {step === 3 && (
                <StepContainer key="recommendations">
                  {loading ? (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        <Sparkles className="w-12 h-12 text-orange-500" />
                      </motion.div>
                      <p className="text-white text-lg mt-4">Personalizing your experience...</p>
                    </div>
                  ) : profile ? (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 mb-4"
                        >
                          <Check className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          You're All Set!
                        </h2>
                        <p className="text-slate-400">
                          {profile.personalizationInsights.message}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Recommended For You</h3>
                        <div className="grid gap-3">
                          {profile.recommendedFeatures.slice(0, 3).map((feature, i) => (
                            <motion.div
                              key={feature.feature}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-white/5 rounded-xl p-4 border border-white/10"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-white font-medium mb-1 capitalize">
                                    {feature.feature.replace(/-/g, ' ')}
                                  </h4>
                                  <p className="text-slate-400 text-sm">{feature.reason}</p>
                                </div>
                                <CinematicBadge variant={feature.priority === 'high' ? 'success' : 'info'} size="sm">
                                  {feature.priority}
                                </CinematicBadge>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </StepContainer>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === step ? 'w-8 bg-orange-500' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {step > 0 && (
                  <CinematicButton
                    variant="ghost"
                    icon={ArrowLeft}
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Back
                  </CinematicButton>
                )}
                
                <CinematicButton
                  variant="primary"
                  icon={step === totalSteps - 1 ? Check : ArrowRight}
                  iconPosition="right"
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  loading={loading}
                  glow
                >
                  {step === totalSteps - 1 ? 'Start Using FlashFusion' : 'Continue'}
                </CinematicButton>
              </div>
            </div>
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

function StepContainer({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[400px] flex flex-col justify-center"
    >
      {children}
    </motion.div>
  );
}

export default OnboardingWizard;