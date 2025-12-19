/**
 * Personalized Insights Widget
 * AI-driven suggestions based on user activity and preferences
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../../atoms/CinematicCard';
import { CinematicBadge } from '../../atoms/CinematicBadge';
import { CinematicButton } from '../../atoms/CinematicButton';
import { Sparkles, TrendingUp, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { aiService } from '../../services/AIService';
import { onboardingService } from '../../services/OnboardingService';

export function PersonalizedInsights({ user }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [user?.id]);

  const generateInsights = async () => {
    try {
      setLoading(true);

      // Fetch user activity data
      const [projects, onboarding, executions] = await Promise.all([
        base44.entities.Project.filter({ created_by: user.email }).catch(() => []),
        onboardingService.getOrCreateOnboarding(user.id).catch(() => null),
        base44.entities.PromptExecutionLog.filter({ created_by: user.email }, '-created_date', 20).catch(() => []),
      ]);

      // Generate AI insights
      const analysisPrompt = `Analyze this user's activity and generate 3-4 personalized insights and recommendations:

User Profile:
- Type: ${onboarding?.user_type || 'general'}
- Interests: ${onboarding?.interests?.join(', ') || 'exploring'}
- Experience: ${onboarding?.experience_level || 'beginner'}

Activity:
- Projects: ${projects.length} (types: ${projects.map(p => p.type).join(', ')})
- Recent Executions: ${executions.length}
- Most Used Tools: ${executions.slice(0, 5).map(e => e.prompt_template_id).join(', ')}

Return JSON array of insights:
[{
  "type": "achievement|suggestion|trend|opportunity",
  "title": "Brief title",
  "description": "Actionable description",
  "action": "CTA text",
  "actionUrl": "/page-name",
  "priority": "high|medium|low"
}]`;

      const aiInsights = await aiService.invokeLLM({
        prompt: analysisPrompt,
        schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  action: { type: 'string' },
                  actionUrl: { type: 'string' },
                  priority: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setInsights(aiInsights.insights || []);
    } catch (error) {
      console.error('Failed to generate insights', error);
      // Fallback insights
      setInsights([
        {
          type: 'suggestion',
          title: 'Start Your First Project',
          description: 'Create a project using our AI-powered tools to get started.',
          action: 'Create Project',
          actionUrl: '/app-builder',
          priority: 'high',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'achievement': return TrendingUp;
      case 'suggestion': return Lightbulb;
      case 'trend': return Sparkles;
      default: return ArrowRight;
    }
  };

  const getBadgeVariant = (priority) => {
    switch (priority) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <CinematicCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-white">Personalized Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </CinematicCard>
    );
  }

  return (
    <CinematicCard className="p-6" glow glowColor="magenta">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-600/20">
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Personalized Insights</h3>
        </div>
        <CinematicBadge variant="info" size="sm">AI-Powered</CinematicBadge>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.type);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => insight.actionUrl && (window.location.href = insight.actionUrl)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
                  <Icon className="w-5 h-5 text-white/90" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {insight.title}
                    </h4>
                    {insight.priority && (
                      <CinematicBadge variant={getBadgeVariant(insight.priority)} size="sm">
                        {insight.priority}
                      </CinematicBadge>
                    )}
                  </div>
                  
                  <p className="text-sm text-white/70 mb-3">
                    {insight.description}
                  </p>
                  
                  {insight.action && (
                    <div className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                      {insight.action}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <CinematicButton
          variant="ghost"
          size="sm"
          icon={Sparkles}
          onClick={generateInsights}
          className="w-full"
        >
          Refresh Insights
        </CinematicButton>
      </div>
    </CinematicCard>
  );
}

export default PersonalizedInsights;