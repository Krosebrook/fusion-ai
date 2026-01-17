/**
 * CI/CD Hub Page
 * Unified dashboard for build, test, deploy, and monitoring
 */
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolIntegrationHub } from '@/components/cicd/ToolIntegrationHub';
import { PipelineIntelligence } from '@/components/cicd/PipelineIntelligence';
import { EnvironmentDriftDetection } from '@/components/cicd/EnvironmentDriftDetection';
import { AutomatedRollbackManager } from '@/components/cicd/AutomatedRollbackManager';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Zap, Shield, GitBranch } from 'lucide-react';

export default function CICDHubPage() {
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
              <h1 className="text-4xl font-bold text-white">CI/CD Hub</h1>
              <p className="text-white/60">Integrated pipelines, intelligent automation, and deployment safety</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="intelligence" className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10">
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Pipeline Intelligence
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Tool Integrations
            </TabsTrigger>
            <TabsTrigger value="drift" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Environment Safety
            </TabsTrigger>
            <TabsTrigger value="rollback" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Deployment Safety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligence" className="mt-6">
            <PipelineIntelligence />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <ToolIntegrationHub />
          </TabsContent>

          <TabsContent value="drift" className="mt-6">
            <CinematicCard className="p-6">
              <EnvironmentDriftDetection />
            </CinematicCard>
          </TabsContent>

          <TabsContent value="rollback" className="mt-6">
            <AutomatedRollbackManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}