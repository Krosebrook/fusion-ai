import { Code, FileText, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const toolsByRole = {
  developer: [
    {
      id: 'app_builder',
      name: 'Full-Stack App Builder',
      description: 'Generate complete React+Node.js applications with database',
      icon: Code,
      color: 'from-orange-500 to-red-500',
      time: '3-5 minutes',
      popular: true
    },
    {
      id: 'api_generator',
      name: 'API Generator',
      description: 'Create REST APIs with authentication and documentation',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      time: '1-2 minutes',
      popular: false
    }
  ],
  creator: [
    {
      id: 'content_studio',
      name: 'Content Studio',
      description: 'Generate blog posts, social media, and marketing content',
      icon: FileText,
      color: 'from-cyan-500 to-blue-500',
      time: '30 sec - 2 min',
      popular: true
    },
    {
      id: 'marketing_suite',
      name: 'Marketing Suite',
      description: 'SEO-optimized content and email campaigns',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500',
      time: '1-3 minutes',
      popular: false
    }
  ],
  business: [
    {
      id: 'analytics',
      name: 'Business Intelligence Hub',
      description: 'AI-powered analytics with forecasts and insights',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-500',
      time: 'Real-time',
      popular: true
    },
    {
      id: 'workflows',
      name: 'Workflow Automation',
      description: 'Automate business processes with AI agents',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      time: '2-5 minutes',
      popular: false
    }
  ]
};

export default function RecommendedTools({ role, onTryTool }) {
  const tools = toolsByRole[role] || toolsByRole.developer;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Perfect tools for you
        </h2>
        <p className="text-gray-400">
          Start with our most popular tool, or explore all options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          const isPrimary = idx === 0;

          return (
            <div
              key={tool.id}
              className={`
                relative group p-6 rounded-xl border transition-all duration-300
                ${isPrimary 
                  ? 'bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-500/50'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {/* Popular Badge */}
              {tool.popular && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-lg mb-4 flex items-center justify-center
                bg-gradient-to-br ${tool.color}
              `}>
                <Icon size={28} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2">
                {tool.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {tool.description}
              </p>

              {/* Time Badge */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M6 3V6L8 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                {tool.time}
              </div>

              {/* CTA */}
              <Button
                onClick={() => onTryTool(tool.id)}
                className={`
                  w-full group-hover:scale-105 transition-transform
                  ${isPrimary 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                {isPrimary ? 'Start Here' : 'Try This Tool'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}