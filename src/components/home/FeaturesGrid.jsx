import React from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { 
  Code, Globe, Brain, Zap, ShoppingCart, Shield, BarChart3, Workflow 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Code,
    title: "AI Code Generation",
    description: "Generate production-ready code in any language with advanced AI models trained on billions of code examples",
    badge: "99.9% accuracy",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Globe,
    title: "Website Cloner",
    description: "Clone any website with AI-powered code generation. Convert designs to code instantly",
    badge: "NEW",
    gradient: "from-blue-500 to-cyan-500",
    link: createPageUrl("WebsiteCloner"),
  },
  {
    icon: Brain,
    title: "Content Creation",
    description: "Create stunning visuals, compelling copy, and engaging media content at the speed of thought",
    badge: "No limits",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "One-Click Deploy",
    description: "Deploy your applications instantly across 20+ platforms with automated optimization and scaling",
    badge: "Fastest Deploy",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: ShoppingCart,
    title: "Revenue Streams",
    description: "Built-in monetization tools including marketplace integration, subscription management, and analytics",
    badge: "Up to $16.9K",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption, SOC 2 compliance, and advanced threat protection",
    badge: "100% secure",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Real-time performance tracking, user behavior analysis, and AI-powered optimization recommendations",
    badge: "Real-time data",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Workflow,
    title: "Multi-Agent Orchestration",
    description: "Coordinate multiple AI agents to handle complex workflows and automate business processes",
    badge: "Advanced",
    gradient: "from-cyan-500 to-blue-500",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 px-6 bg-gray-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4 font-['Space_Grotesk']"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              create & scale
            </span>
          </motion.h2>
          <p className="text-gray-400 text-lg">
            Professional-grade AI tools designed for creators, developers, and entrepreneurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => feature.link && (window.location.href = feature.link)}
              className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all ${
                feature.link ? 'cursor-pointer hover:scale-105' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                {feature.badge && (
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                    {feature.badge}
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}