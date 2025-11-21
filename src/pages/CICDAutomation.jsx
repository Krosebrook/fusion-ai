import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PipelineConfigurator from "../components/cicd/PipelineConfigurator";
import PipelineStatus from "../components/cicd/PipelineStatus";
import DeploymentTimeline from "../components/cicd/DeploymentTimeline";
import EnvironmentManager from "../components/cicd/EnvironmentManager";
import { Rocket, GitBranch, Activity, Plus, RefreshCw, Server, BarChart3, Shield, Lock, Wand2, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PermissionGuard, usePermissions } from "../components/rbac/PermissionGuard";

export default function CICDAutomationPage() {
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = usePermissions();
  const [showConfig, setShowConfig] = useState(false);
  const [showEnvironments, setShowEnvironments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [configs, setConfigs] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [history, setHistory] = useState([]);

  const { data: pipelineConfigs, refetch: refetchConfigs } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.filter({ active: true }),
    initialData: []
  });

  const { data: pipelineRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['pipelineRuns'],
    queryFn: () => base44.entities.PipelineRun.list('-created_date', 20),
    initialData: []
  });

  useEffect(() => {
    if (pipelineRuns.length > 0) {
      setPipelines(pipelineRuns.slice(0, 5).map(run => ({
        id: run.id,
        name: pipelineConfigs.find(c => c.id === run.pipeline_config_id)?.name || 'Unknown',
        branch: run.branch,
        commit: run.commit?.substring(0, 7),
        status: run.status,
        progress: run.progress || 0,
        triggeredBy: run.triggered_by,
        duration: run.duration_seconds ? `${Math.floor(run.duration_seconds / 60)}m ${run.duration_seconds % 60}s` : '—',
        steps: run.steps || []
      })));

      setHistory(pipelineRuns.map(run => {
        const config = pipelineConfigs.find(c => c.id === run.pipeline_config_id);
        return {
          id: run.id,
          environment: config?.environment || 'production',
          status: run.status,
          timestamp: new Date(run.created_date).toLocaleString(),
          commit: run.commit?.substring(0, 7),
          branch: run.branch,
          triggeredBy: run.triggered_by,
          duration: run.duration_seconds ? `${Math.floor(run.duration_seconds / 60)}m ${run.duration_seconds % 60}s` : '—',
          url: run.deployment_url
        };
      }));
    }
  }, [pipelineRuns, pipelineConfigs]);

  const handleSaveConfig = async (config) => {
    try {
      const workflowContent = await base44.functions.invoke('githubActions', {
        action: 'create_workflow',
        repository: config.repository_name,
        config
      });

      await base44.entities.PipelineConfig.create({
        name: config.projectType + ' Pipeline',
        provider: config.provider,
        repository_name: config.repository_name,
        repository_id: config.repository_id,
        repository_url: config.repository_url,
        available_branches: config.available_branches,
        branch: config.branch,
        project_type: config.projectType,
        environment: config.environment,
        triggers: config.triggers,
        build_command: config.buildCommand,
        test_command: config.testCommand,
        deploy_command: config.deployCommand,
        auto_scale: config.autoScale,
        notifications: config.notifications,
        quality_gates: config.quality_gates,
        workflow_file: workflowContent.workflow
      });

      await refetchConfigs();
      setShowConfig(false);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleTriggerPipeline = async (id) => {
    try {
      const run = pipelineRuns.find(r => r.id === id);
      const config = pipelineConfigs.find(c => c.id === run?.pipeline_config_id);
      
      if (config) {
        await base44.functions.invoke('githubActions', {
          action: 'trigger_workflow',
          repository: config.repository_name,
          workflow_id: config.name.toLowerCase().replace(/\s/g, '-'),
          config
        });
        
        await refetchRuns();
      }
    } catch (error) {
      console.error('Failed to trigger pipeline:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchConfigs(), refetchRuns()]);
    setRefreshing(false);
  };

  const stats = {
    totalRuns: pipelineRuns.length,
    successRate: pipelineRuns.length > 0 
      ? ((pipelineRuns.filter(r => r.status === 'success').length / pipelineRuns.length) * 100).toFixed(1)
      : 0,
    avgDuration: pipelineRuns.length > 0
      ? `${Math.floor(pipelineRuns.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / pipelineRuns.length / 60)}m`
      : '—',
    activeRuns: pipelines.filter(p => p.status === 'running').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CI/CD Automation
            </h1>
            <p className="text-gray-400">Automate your full development lifecycle</p>
          </div>

          <div className="flex gap-3">
            <PermissionGuard resource="pipelines" action="create">
              <Button
                onClick={() => navigate(createPageUrl("AIPipelineGenerator"))}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generator
              </Button>
            </PermissionGuard>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-white/10 text-gray-300"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <PermissionGuard resource="analytics" action="view">
              <Button
                onClick={() => navigate(createPageUrl("CICDAnalytics"))}
                variant="outline"
                className="border-purple-500/30 text-purple-400"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </PermissionGuard>
            <PermissionGuard resource="environments" action="read">
              <Button
                onClick={() => setShowEnvironments(!showEnvironments)}
                variant="outline"
                className="border-blue-500/30 text-blue-400"
              >
                <Server className="w-4 h-4 mr-2" />
                Environments
              </Button>
            </PermissionGuard>
            <Button
              onClick={() => navigate(createPageUrl("Secrets"))}
              variant="outline"
              className="border-purple-500/30 text-purple-400"
            >
              <Lock className="w-4 h-4 mr-2" />
              Secrets
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("APIIntegration"))}
              variant="outline"
              className="border-blue-500/30 text-blue-400"
            >
              <Code2 className="w-4 h-4 mr-2" />
              API
            </Button>
            <PermissionGuard resource="pipelines" action="create">
              <Button
                onClick={() => setShowConfig(!showConfig)}
                className="bg-gradient-to-r from-orange-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Configure Pipeline
              </Button>
            </PermissionGuard>
            {isAdmin() && (
              <Button
                onClick={() => navigate(createPageUrl("AccessControl"))}
                variant="outline"
                className="border-purple-500/30 text-purple-400"
              >
                <Shield className="w-4 h-4 mr-2" />
                Access Control
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Runs", value: stats.totalRuns, icon: Activity, color: "#00B4D8" },
            { label: "Success Rate", value: `${stats.successRate}%`, icon: Rocket, color: "#10B981" },
            { label: "Avg Duration", value: stats.avgDuration, icon: Activity, color: "#F59E0B" },
            { label: "Active Runs", value: stats.activeRuns, icon: GitBranch, color: "#8B5CF6" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Environment Manager */}
        {showEnvironments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <EnvironmentManager />
          </motion.div>
        )}

        {/* Pipeline Configurator */}
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PipelineConfigurator onSave={handleSaveConfig} />
          </motion.div>
        )}

        {/* Active Pipelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Activity className="w-5 h-5 text-orange-400" />
              Active Pipelines
            </h2>
          </div>
          <PipelineStatus 
            pipelines={pipelines.map(p => ({ 
              ...p, 
              pipeline_config_id: pipelineRuns.find(r => r.id === p.id)?.pipeline_config_id 
            }))} 
            onTrigger={handleTriggerPipeline} 
          />
        </motion.div>

        {/* Deployment Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DeploymentTimeline history={history} />
        </motion.div>
      </div>
    </div>
  );
}