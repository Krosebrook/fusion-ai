/**
 * Onboarding Service
 * AI-driven personalized user onboarding with adaptive tutorials
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';
import { errorService } from './ErrorService';
import { logger } from '../core/logger';

export interface OnboardingProfile {
  userType: string;
  interests: string[];
  experienceLevel: string;
  recommendedFeatures: RecommendedFeature[];
  suggestedTemplates: string[];
  suggestedAgents: string[];
  personalizationInsights: Record<string, any>;
}

export interface RecommendedFeature {
  feature: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  tutorialSteps: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  targetElement?: string;
  completionCriteria?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  estimatedMinutes: number;
  prerequisites?: string[];
}

class OnboardingService {
  private onboardingSteps: Map<string, OnboardingStep[]> = new Map();

  constructor() {
    this.initializeSteps();
  }

  /**
   * Initialize onboarding steps for different user types
   */
  private initializeSteps() {
    // Developer-focused steps
    this.onboardingSteps.set('developer', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'Your AI-powered development platform',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
      {
        id: 'code-generation',
        title: 'AI Code Generation',
        description: 'Generate production-ready code with AI',
        component: 'CodeGenerationTutorial',
        required: false,
        estimatedMinutes: 3,
      },
      {
        id: 'agent-setup',
        title: 'Configure AI Agents',
        description: 'Set up agents for code review and automation',
        component: 'AgentSetupTutorial',
        required: false,
        estimatedMinutes: 5,
      },
      {
        id: 'cicd-pipeline',
        title: 'CI/CD Integration',
        description: 'Connect your repositories and automate deployments',
        component: 'CICDTutorial',
        required: false,
        estimatedMinutes: 4,
      },
    ]);

    // Content creator steps
    this.onboardingSteps.set('content_creator', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'Your AI-powered creative studio',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
      {
        id: 'content-studio',
        title: 'Content Generation',
        description: 'Create engaging content with AI',
        component: 'ContentStudioTutorial',
        required: false,
        estimatedMinutes: 3,
      },
      {
        id: 'image-generation',
        title: 'Visual Creation',
        description: 'Generate stunning images and graphics',
        component: 'ImageGenerationTutorial',
        required: false,
        estimatedMinutes: 4,
      },
      {
        id: 'prompt-engineering',
        title: 'Prompt Mastery',
        description: 'Learn advanced prompt engineering techniques',
        component: 'PromptEngineeringTutorial',
        required: false,
        estimatedMinutes: 5,
      },
    ]);

    // Business user steps
    this.onboardingSteps.set('business_user', [
      {
        id: 'welcome',
        title: 'Welcome to FlashFusion',
        description: 'AI automation for your business',
        component: 'WelcomeStep',
        required: true,
        estimatedMinutes: 1,
      },
      {
        id: 'agent-orchestration',
        title: 'Workflow Automation',
        description: 'Automate business processes with AI agents',
        component: 'WorkflowTutorial',
        required: false,
        estimatedMinutes: 5,
      },
      {
        id: 'analytics',
        title: 'Analytics Dashboard',
        description: 'Track performance and insights',
        component: 'AnalyticsTutorial',
        required: false,
        estimatedMinutes: 3,
      },
    ]);
  }

  /**
   * Create or get user onboarding record
   */
  async getOrCreateOnboarding(userId: string): Promise<any> {
    try {
      const existing = await base44.entities.UserOnboarding.filter({ user_id: userId });
      
      if (existing.length > 0) {
        return existing[0];
      }

      // Create new onboarding record
      return await base44.entities.UserOnboarding.create({
        user_id: userId,
        status: 'not_started',
        completed_steps: [],
        skipped_steps: [],
        first_actions: [],
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      errorService.handle(error as Error, { action: 'getOrCreateOnboarding', userId }, 'high');
      throw error;
    }
  }

  /**
   * Analyze user intent and personalize onboarding
   */
  async analyzeUserIntent(input: {
    role?: string;
    goals?: string[];
    experience?: string;
    firstActions?: any[];
  }): Promise<OnboardingProfile> {
    try {
      logger.info('Analyzing user intent for onboarding', { input });

      const prompt = `Analyze this user profile and recommend a personalized onboarding experience:

User Input:
${JSON.stringify(input, null, 2)}

Determine:
1. Best user type classification (developer, content_creator, business_user, data_scientist, student)
2. Key areas of interest (code_generation, content_creation, ai_agents, automation, analytics, image_generation, prompt_engineering, cicd)
3. Experience level (beginner, intermediate, advanced)
4. Top 3-5 recommended features with reasoning
5. Suggested starter templates or examples
6. Suggested agent configurations
7. Personalized onboarding path

Return JSON:
{
  "userType": "string",
  "interests": ["string"],
  "experienceLevel": "string",
  "recommendedFeatures": [
    {
      "feature": "string",
      "reason": "why this matters to them",
      "priority": "high|medium|low"
    }
  ],
  "suggestedTemplates": ["template IDs or names"],
  "suggestedAgents": ["agent configurations"],
  "personalizedMessage": "welcoming message tailored to their needs",
  "onboardingPath": ["step IDs in recommended order"]
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
        recommendedFeatures: analysis.recommendedFeatures.map((f: any) => ({
          ...f,
          tutorialSteps: this.generateTutorialSteps(f.feature),
        })),
        suggestedTemplates: analysis.suggestedTemplates,
        suggestedAgents: analysis.suggestedAgents,
        personalizationInsights: {
          message: analysis.personalizedMessage,
          path: analysis.onboardingPath,
        },
      };
    } catch (error) {
      errorService.handle(error as Error, { action: 'analyzeUserIntent' }, 'high');
      // Return default profile on error
      return this.getDefaultProfile();
    }
  }

  /**
   * Track user action during onboarding
   */
  async trackAction(userId: string, action: string, context?: any): Promise<void> {
    try {
      const onboarding = await this.getOrCreateOnboarding(userId);
      
      const actionData = {
        action,
        timestamp: new Date().toISOString(),
        context,
      };

      const firstActions = onboarding.first_actions || [];
      firstActions.push(actionData);

      await base44.entities.UserOnboarding.update(onboarding.id, {
        first_actions: firstActions,
      });

      // If we have enough data, trigger re-personalization
      if (firstActions.length >= 3 && !onboarding.user_type) {
        await this.refinePersonalization(userId);
      }
    } catch (error) {
      logger.error('Failed to track onboarding action', { error, userId, action });
    }
  }

  /**
   * Refine personalization based on observed behavior
   */
  async refinePersonalization(userId: string): Promise<void> {
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

  /**
   * Complete onboarding step
   */
  async completeStep(userId: string, stepId: string): Promise<void> {
    try {
      const onboarding = await this.getOrCreateOnboarding(userId);
      
      const completedSteps = [...(onboarding.completed_steps || []), stepId];
      
      await base44.entities.UserOnboarding.update(onboarding.id, {
        completed_steps: completedSteps,
        current_step: null,
      });

      logger.info('Onboarding step completed', { userId, stepId });
    } catch (error) {
      errorService.handle(error as Error, { action: 'completeStep', userId, stepId }, 'medium');
    }
  }

  /**
   * Skip onboarding step
   */
  async skipStep(userId: string, stepId: string): Promise<void> {
    try {
      const onboarding = await this.getOrCreateOnboarding(userId);
      
      const skippedSteps = [...(onboarding.skipped_steps || []), stepId];
      
      await base44.entities.UserOnboarding.update(onboarding.id, {
        skipped_steps: skippedSteps,
        current_step: null,
      });
    } catch (error) {
      logger.error('Failed to skip step', { error, userId, stepId });
    }
  }

  /**
   * Complete entire onboarding
   */
  async completeOnboarding(userId: string): Promise<void> {
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
      errorService.handle(error as Error, { action: 'completeOnboarding', userId }, 'medium');
    }
  }

  /**
   * Get onboarding steps for user type
   */
  getStepsForUserType(userType: string): OnboardingStep[] {
    return this.onboardingSteps.get(userType) || this.onboardingSteps.get('developer') || [];
  }

  /**
   * Generate tutorial steps for a feature
   */
  private generateTutorialSteps(feature: string): TutorialStep[] {
    const tutorialMap: Record<string, TutorialStep[]> = {
      'code-generation': [
        {
          id: 'open-code-gen',
          title: 'Open AI Code Generator',
          description: 'Navigate to the AI Code Generation tool',
          targetElement: '[data-tour="code-generator"]',
        },
        {
          id: 'describe-project',
          title: 'Describe Your Project',
          description: 'Enter what you want to build',
          targetElement: '[data-tour="project-input"]',
        },
        {
          id: 'generate-code',
          title: 'Generate Code',
          description: 'Click generate to create your project',
          targetElement: '[data-tour="generate-button"]',
        },
      ],
      'prompt-hub': [
        {
          id: 'browse-templates',
          title: 'Browse Templates',
          description: 'Explore our library of prompt templates',
          targetElement: '[data-tour="template-library"]',
        },
        {
          id: 'test-prompt',
          title: 'Test a Prompt',
          description: 'Try executing a template in the workspace',
          targetElement: '[data-tour="prompt-workspace"]',
        },
      ],
    };

    return tutorialMap[feature] || [];
  }

  /**
   * Get default onboarding profile
   */
  private getDefaultProfile(): OnboardingProfile {
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

export const onboardingService = new OnboardingService();
export default onboardingService;