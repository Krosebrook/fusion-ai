import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GlassmorphicCard } from '@/components/ui-library';
import { Clock } from 'lucide-react';
import { 
  Code, FileText, TrendingUp, Shield, ShoppingCart, Sparkles
} from 'lucide-react';

const AI_TOOLS = [
  {
    id: 'app-builder',
    name: 'Full-Stack App Builder',
    description: 'Complete web application with frontend, backend, and database',
    icon: Code,
    color: '#FF7B00',
    time: '3-5 minutes',
    page: 'AppBuilder'
  },
  {
    id: 'content-studio',
    name: 'Educational Content Studio',
    description: 'Blog posts, social media content, and marketing materials',
    icon: FileText,
    color: '#00B4D8',
    time: '30 seconds - 2 minutes',
    page: 'ContentStudio'
  },
  {
    id: 'analytics',
    name: 'Business Intelligence Hub',
    description: 'Track performance, audience, and AI-powered insights',
    icon: TrendingUp,
    color: '#10B981',
    time: 'Real-time data',
    page: 'Analytics'
  },
  {
    id: 'security',
    name: 'Enterprise Security Suite',
    description: 'All-in-one security with end-to-end advanced protection',
    icon: Shield,
    color: '#8B5CF6',
    time: 'Always on',
    page: 'Security'
  },
  {
    id: 'commerce',
    name: 'Creator Commerce Hub',
    description: 'Turn your creative work into revenue with integrated tools',
    icon: ShoppingCart,
    color: '#E91E63',
    time: '2-3 days',
    page: 'Commerce'
  },
  {
    id: 'orchestration',
    name: 'Multi-Agent Orchestration',
    description: 'Reusable components, API endpoints, and integrations',
    icon: Sparkles,
    color: '#F59E0B',
    time: '1-3 minutes',
    page: 'Orchestration'
  }
];

export function AIToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {AI_TOOLS.map((tool, index) => (
        <Link key={tool.id} to={createPageUrl(tool.page)}>
          <GlassmorphicCard 
            className="p-6 h-full cursor-pointer"
            delay={index * 0.05}
            hover
          >
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)` 
              }}
            >
              <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {tool.name}
            </h3>

            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {tool.description}
            </p>

            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: tool.color }}>
              <Clock className="w-3.5 h-3.5" />
              {tool.time}
            </div>
          </GlassmorphicCard>
        </Link>
      ))}
    </div>
  );
}