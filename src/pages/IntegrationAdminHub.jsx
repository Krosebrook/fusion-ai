/**
 * Integration Admin Hub
 * Comprehensive dashboard for integration health, rate limits, queue depth, and manual controls
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationHealthDashboard } from '@/components/integrations/IntegrationHealthDashboard';
import { IntegrationRateLimitViewer } from '@/components/integrations/IntegrationRateLimitViewer';
import { OutboxQueueDepthChart } from '@/components/integrations/OutboxQueueDepthChart';
import { Activity, Zap, TrendingUp } from 'lucide-react';

export default function IntegrationAdminHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Integration Admin Hub</h1>
              <p className="text-white/60">Health monitoring, rate limits, queue management, and manual controls</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health Score
            </TabsTrigger>
            <TabsTrigger value="ratelimits" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Rate Limits
            </TabsTrigger>
            <TabsTrigger value="queuedepth" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Queue Depth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-8">
            <IntegrationHealthDashboard />
          </TabsContent>

          <TabsContent value="ratelimits" className="mt-8">
            <IntegrationRateLimitViewer />
          </TabsContent>

          <TabsContent value="queuedepth" className="mt-8">
            <OutboxQueueDepthChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}