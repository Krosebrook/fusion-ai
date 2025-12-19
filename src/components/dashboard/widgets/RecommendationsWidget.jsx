/**
 * Recommendations Widget
 * AI-powered feature and tool recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../../atoms/CinematicCard';
import { CinematicButton } from '../../atoms/CinematicButton';
import { Lightbulb, Star, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export function RecommendationsWidget({ user }) {
  const recommendations = [
    {
      title: 'Try Advanced Prompts',
      description: 'Unlock sophisticated prompt engineering with chains and experiments.',
      action: 'Explore Prompt Hub',
      url: createPageUrl('PromptHub'),
      icon: '🎯',
    },
    {
      title: 'Set Up CI/CD',
      description: 'Automate your deployments with AI-powered pipeline generation.',
      action: 'Configure Pipeline',
      url: createPageUrl('CICDAutomation'),
      icon: '🚀',
    },
    {
      title: 'Create Agent Workflows',
      description: 'Build multi-agent systems for complex automation tasks.',
      action: 'Build Workflow',
      url: createPageUrl('AgentOrchestration'),
      icon: '🤖',
    },
  ];

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Recommendations</h3>
        </div>
        <Star className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{rec.icon}</span>
              
              <div className="flex-1">
                <h4 className="text-base font-semibold text-white mb-1">
                  {rec.title}
                </h4>
                <p className="text-sm text-white/70 mb-3">
                  {rec.description}
                </p>
                
                <a href={rec.url}>
                  <CinematicButton
                    variant="ghost"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    {rec.action}
                  </CinematicButton>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CinematicCard>
  );
}

export default RecommendationsWidget;