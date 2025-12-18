/**
 * Onboarding Service
 * AI-driven personalized user onboarding with adaptive tutorials
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';
import { errorService } from './ErrorService';
import { logger } from '../core/logger';

class OnboardingService {
  constructor() {
    this.onboardingSteps = new Map();
    this.initializeSteps();
  }

  initializeSteps() {
    this.onboardingSteps.set('developer', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'Your AI-powered development platform',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
    ]);

    this.onboardingSteps.set('content_creator', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'Your AI-powered creative studio',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
    ]);

    this.onboardingSteps.set('business_user', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'AI automation for your business',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
    ]);
  }

  async getOrCreateOnboarding(userId) {
    try {
      const existing = await base44.entities.UserOnboarding.filter({ user_id: userId });
      
      if (existing.length > 0) {
        return existing[0];
      }

      return await base44.entities.UserOnboarding.create({
        user_id: userId,
        status: 'not_started',
        completed_steps: [],
        skipped_steps: [],
        first_actions: [],
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      errorService.handle(error, { action: 'getOrCreateOnboarding', userId }, 'high');
      throw error;
    }
  }

  async analyzeUserIntent(input) {
    try {
      logger.info('Analyzing user intent for onboarding', { input });

      const prompt = `Analyze this user profile and recommend a personalized onboarding experience:

User Input:
${JSON.stringify(input, null, 2)}

Return JSON:
{
  "userType": "developer",
  "interests": ["code_generation"],
  "experienceLevel": "beginner",
  "recommendedFeatures": [{"feature": "ai-studio", "reason": "Great starting point", "priority": "high"}],
  "suggestedTemplates": [],
  "suggestedAgents": [],
  "personalizedMessage": "Welcome!",
  "onboardingPath": []
}`;

      const analysis = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            userType: { type: 'string' },
            interests: { type: 'array', items: { type: 'string' } },
            experienceLevel: { type: 'string' },
            recommendedFeatures: { type: 'array' },
            suggestedTemplates: { type: 'array' },
            suggestedAgents: { type: 'array' },
            personalizedMessage: { type: 'string' },
            onboardingPath: { type: 'array' },
          },
        },
      });

      return {
        userType: analysis.userType,
        interests: analysis.interests,
        experienceLevel: analysis.experienceLevel,
        recommendedFeatures: analysis.recommendedFeatures.map(f => ({
          ...f,
          tutorialSteps: [],
        })),
        suggestedTemplates: analysis.suggestedTemplates,
        suggestedAgents: analysis.suggestedAgents,
        personalizationInsights: {
          message: analysis.personalizedMessage,
          path: analysis.onboardingPath,
        },
      };
    } catch (error) {
      errorService.handle(error, { action: 'analyzeUserIntent' }, 'high');
      return this.getDefaultProfile();
    }
  }

  async refinePersonalization(userId) {
    try {
      const onboarding = await this.getOrCreateOnboarding(userId);
      
      const profile = await this.analyzeUserIntent({
        firstActions: onboarding.first_actions,
      });

      await base44.entities.UserOnboarding.update(onboarding.id, {
        user_type: profile.userType,
        interests: profile.interests,
        experience_level: profile.experienceLevel,
        recommended_features: profile.recommendedFeatures,
        suggested_templates: profile.suggestedTemplates,
        suggested_agents: profile.suggestedAgents,
        personalization_data: profile.personalizationInsights,
      });

      logger.info('Refined personalization', { userId, userType: profile.userType });
    } catch (error) {
      logger.error('Failed to refine personalization', { error, userId });
    }
  }

  async completeOnboarding(userId) {
    try {
      const onboarding = await this.getOrCreateOnboarding(userId);
      
      const timeSpent = onboarding.started_at
        ? (Date.now() - new Date(onboarding.started_at).getTime()) / 1000
        : 0;

      await base44.entities.UserOnboarding.update(onboarding.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpent,
      });

      logger.info('Onboarding completed', { userId, timeSpent });
    } catch (error) {
      errorService.handle(error, { action: 'completeOnboarding', userId }, 'medium');
    }
  }

  generateTutorialSteps() {
    return [];
  }

  getDefaultProfile() {
    return {
      userType: 'undecided',
      interests: [],
      experienceLevel: 'beginner',
      recommendedFeatures: [
        {
          feature: 'ai-studio',
          reason: 'Great starting point for exploring AI capabilities',
          priority: 'high',
          tutorialSteps: [],
        },
      ],
      suggestedTemplates: [],
      suggestedAgents: [],
      personalizationInsights: {
        message: 'Welcome to FlashFusion! Let\'s explore what you can build.',
      },
    };
  }
}

const onboardingService = new OnboardingService();

export { onboardingService };
export default onboardingService;