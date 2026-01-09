/**
 * Prompt Deployment Manager - CI/CD integration for prompts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptEnvironmentManager } from './PromptEnvironmentManager';
import { PromptQualityGates } from './PromptQualityGates';
import { 
  Rocket, GitBranch, Check, AlertCircle, 
  Clock, Zap, Settings, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PromptDeploymentManager() {
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState('development');

  const { data: pipelines = [] } = useQuery({
    queryKey: ['cicd-pipelines'],
    queryFn: () => base44.entities.PipelineConfig?.list?.('-created_date', 50) || []
  });

  const { data: promptVersions = [] } = useQuery({
    queryKey: ['prompt-template-versions'],
    queryFn: () => base44.entities.PromptTemplateVersion?.list?.('-created_at', 100) || []
  });

  const deployPrompt = async (versionId, environment) => {
    try {
      // Run health checks first
      const healthCheck = await base44.functions.invoke('promptHealthCheck', {
        version_id: versionId,
        environment
      });

      if (!healthCheck.passed) {
        toast.error(`Health check failed: ${healthCheck.reason}`);
        return;
      }

      // Run quality gates
      const qualityGate = await base44.functions.invoke('promptQualityGate', {
        version_id: versionId,
        environment,
        checks: ['syntax', 'performance', 'security']
      });

      if (!qualityGate.passed) {
        toast.error(`Quality gate failed: ${qualityGate.failed_checks.join(', ')}`);
        return;
      }

      // Deploy
      await base44.entities.PipelineRun.create({
        pipeline_config_id: selectedPipeline.id,
        status: 'running',
        branch: 'main',
        commit: versionId,
        triggered_by: 'prompt_deployment',
        environment,
        deployment_config: { 
          prompt_version_id: versionId,
          health_check_passed: true,
          quality_gate_passed: true
        }
      });

      toast.success(`Deployment to ${environment} started`);
    } catch (error) {
      toast.error(error?.message || 'Failed to deploy');
    }
  };

  const triggerAutomatedTest = async (versionId) => {
    try {
      const result = await base44.functions.invoke('testPrompts', {
        version_id: versionId,
        test_types: ['regression', 'performance', 'integration']
      });

      if (result.status === 'passed') {
        toast.success(`Tests passed: ${result.passed}/${result.total}`);
      } else {
        toast.error(`Tests failed: ${result.failed} failures`);
      }
    } catch (error) {
      toast.error('Failed to start tests');
    }
  };

  return (
    <Tabs defaultValue="deploy" className="w-full">
      <TabsList className="bg-slate-900/50 border border-white/10">
        <TabsTrigger value="deploy">Deploy</TabsTrigger>
        <TabsTrigger value="environments">Environments</TabsTrigger>
        <TabsTrigger value="quality">Quality Gates</TabsTrigger>
      </TabsList>

      <TabsContent value="deploy" className="space-y-6 mt-6">
        {/* Pipeline Selection */}
        <CinematicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-orange-400" />
          Pipeline Integration
        </h2>

        <select
          value={selectedPipeline?.id || ''}
          onChange={(e) => setSelectedPipeline(pipelines.find(p => p.id === e.target.value))}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
        >
          <option value="">Select a pipeline...</option>
          {pipelines.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {selectedPipeline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <p className="text-white/60 text-sm mb-2">Repository</p>
            <p className="text-white font-mono">{selectedPipeline.repository_name}</p>
            <p className="text-white/60 text-xs mt-2">Default branch: {selectedPipeline.branch}</p>
          </motion.div>
        )}
      </CinematicCard>

        {/* Prompt Versions */}
        {selectedPipeline && (
          <CinematicCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Prompt Versions</h3>
            <div className="space-y-3">
              {promptVersions.slice(0, 10).map((version, idx) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedVersion?.id === version.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">v{version.version_number}</p>
                      <p className="text-white/60 text-sm">{version.change_summary}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                      {new Date(version.created_at).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAutomatedTest(version.id);
                      }}
                      className="bg-purple-600 text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deployPrompt(version.id, 'development');
                      }}
                      className="bg-blue-600 text-xs"
                    >
                      Dev
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deployPrompt(version.id, 'staging');
                      }}
                      className="bg-yellow-600 text-xs"
                    >
                      Staging
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deployPrompt(version.id, 'production');
                      }}
                      className="bg-green-600 text-xs"
                    >
                      Prod
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CinematicCard>
        )}
      </TabsContent>

      <TabsContent value="environments" className="mt-6">
        <PromptEnvironmentManager />
      </TabsContent>

      <TabsContent value="quality" className="mt-6">
        {selectedVersion ? (
          <PromptQualityGates 
            versionId={selectedVersion.id}
            environment={selectedEnvironment}
          />
        ) : (
          <CinematicCard className="p-6">
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">Select a prompt version to run quality gates</p>
            </div>
          </CinematicCard>
        )}
      </TabsContent>
    </Tabs>
  );
}