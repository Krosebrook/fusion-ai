import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, Rocket, GitBranch, ArrowRight, Plus, Settings, Shield,
  CheckCircle2, XCircle, Clock, Activity, Layers, RefreshCw
} from "lucide-react";
import EnvironmentCard from "../components/deployment/EnvironmentCard";
import DeploymentStrategies from "../components/deployment/DeploymentStrategies";
import PromotionManager from "../components/deployment/PromotionManager";
import EnvironmentVariables from "../components/deployment/EnvironmentVariables";

export default function DeploymentCenterPage() {
  const queryClient = useQueryClient();
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [showCreateEnv, setShowCreateEnv] = useState(false);

  const { data: environments = [], isLoading } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.Environment.list('-created_date')
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['pipelineRuns'],
    queryFn: () => base44.entities.PipelineRun.list('-created_date', 50)
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.list()
  });

  const envStats = environments.map(env => {
    const envRuns = runs.filter(r => {
      const config = configs.find(c => c.id === r.pipeline_config_id);
      return config?.environment_id === env.id || config?.environment === env.slug;
    });
    return {
      ...env,
      totalDeployments: envRuns.length,
      successRate: envRuns.length > 0 
        ? Math.round(envRuns.filter(r => r.status === 'success').length / envRuns.length * 100)
        : 0,
      lastDeployment: envRuns[0]?.created_date,
      activeRuns: envRuns.filter(r => r.status === 'running').length
    };
  });

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
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Deployment Center
            </h1>
            <p className="text-gray-400">Manage multi-environment deployments with advanced strategies</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateEnv(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Environment
            </Button>
          </div>
        </motion.div>

        {/* Environment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Environments", value: environments.length, icon: Server, color: "#00B4D8" },
            { label: "Total Deployments", value: runs.length, icon: Rocket, color: "#10B981" },
            { label: "Active Deployments", value: runs.filter(r => r.status === 'running').length, icon: Activity, color: "#F59E0B" },
            { label: "Protected Envs", value: environments.filter(e => e.protection_enabled).length, icon: Shield, color: "#8B5CF6" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="environments" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="environments" className="data-[state=active]:bg-blue-500/20">
              <Server className="w-4 h-4 mr-2" />
              Environments
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-blue-500/20">
              <Layers className="w-4 h-4 mr-2" />
              Deployment Strategies
            </TabsTrigger>
            <TabsTrigger value="promotions" className="data-[state=active]:bg-blue-500/20">
              <ArrowRight className="w-4 h-4 mr-2" />
              Promotions
            </TabsTrigger>
            <TabsTrigger value="variables" className="data-[state=active]:bg-blue-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Environment Variables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="environments">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {envStats.map((env, idx) => (
                <EnvironmentCard 
                  key={env.id} 
                  environment={env}
                  onSelect={() => setSelectedEnv(env)}
                  delay={idx * 0.05}
                />
              ))}

              {/* Add Environment Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowCreateEnv(true)}
                className="rounded-xl border-2 border-dashed border-white/20 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all min-h-[200px]"
              >
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-400">Add Environment</p>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <DeploymentStrategies environments={environments} configs={configs} />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionManager environments={environments} runs={runs} configs={configs} />
          </TabsContent>

          <TabsContent value="variables">
            <EnvironmentVariables environments={environments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}