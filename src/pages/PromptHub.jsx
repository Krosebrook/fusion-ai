/**
 * Prompt Engineering Hub
 * Discover, create, optimize, and share AI prompts
 */

import React, { useState } from 'react';
import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { CinematicInput } from '../components/atoms/CinematicInput';
import { CinematicBadge } from '../components/atoms/CinematicBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Sparkles, Search, Plus, TrendingUp, Library, 
  Zap, Share2, Filter, BarChart3, Users
} from 'lucide-react';
import { PromptDiscovery } from '../components/prompt-hub/PromptDiscovery';
import { PromptAnalytics } from '../components/prompt-hub/PromptAnalytics';
import { PromptWorkspace } from '../components/prompt-hub/PromptWorkspace';
import { CommunityTemplates } from '../components/prompt-hub/CommunityTemplates';

export default function PromptHubPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <ProtectedRoute />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Prompt Engineering Hub</h1>
                <p className="text-slate-400 text-lg mt-1">
                  Master AI prompts • Analyze effectiveness • Share with community
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="discover" className="data-[state=active]:bg-orange-500">
              <Library className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="workspace" className="data-[state=active]:bg-orange-500">
              <Zap className="w-4 h-4 mr-2" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-orange-500">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <PromptDiscovery />
          </TabsContent>

          <TabsContent value="workspace">
            <PromptWorkspace />
          </TabsContent>

          <TabsContent value="analytics">
            <PromptAnalytics />
          </TabsContent>

          <TabsContent value="community">
            <CommunityTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}