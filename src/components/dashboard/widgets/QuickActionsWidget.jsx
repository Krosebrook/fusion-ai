/**
 * Quick Actions Widget
 * Context-aware shortcuts based on user workflow
 */

import { motion } from 'framer-motion';
import { CinematicCard } from '../../atoms/CinematicCard';
import { 
  Code, Palette, Zap, FileText, Sparkles, Plus, Upload 
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export function QuickActionsWidget({ user }) {
  const actions = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: Plus,
      description: 'Start a fresh project',
      url: createPageUrl('AppBuilder'),
      gradient: 'from-orange-500 to-pink-600',
    },
    {
      id: 'ai-code',
      label: 'Generate Code',
      icon: Code,
      description: 'AI code generation',
      url: createPageUrl('AICodeGen'),
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'content',
      label: 'Create Content',
      icon: FileText,
      description: 'AI content studio',
      url: createPageUrl('ContentStudio'),
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      id: 'media',
      label: 'Generate Media',
      icon: Palette,
      description: 'Images & videos',
      url: createPageUrl('MediaStudio'),
      gradient: 'from-green-500 to-teal-600',
    },
    {
      id: 'clone',
      label: 'Clone Website',
      icon: Upload,
      description: 'Import existing site',
      url: createPageUrl('WebsiteCloner'),
      gradient: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'prompt',
      label: 'Prompt Hub',
      icon: Sparkles,
      description: 'Advanced prompts',
      url: createPageUrl('PromptHub'),
      gradient: 'from-indigo-500 to-purple-600',
    },
  ];

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.a
              key={action.id}
              href={action.url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} 
              />
              
              <div className="relative">
                <div className="mb-3">
                  <Icon className="w-6 h-6 text-white/90" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {action.label}
                </h4>
                <p className="text-xs text-white/60">
                  {action.description}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </CinematicCard>
  );
}

export default QuickActionsWidget;