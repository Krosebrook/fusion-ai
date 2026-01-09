/**
 * Agent Orchestration Hub
 * Multi-agent workflow orchestration with visualization and real-time monitoring
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { WorkflowBuilder } from '../components/agent-orchestration/WorkflowBuilder';
import { ExecutionMonitor } from '../components/agent-orchestration/ExecutionMonitor';
import { ErrorHandler } from '../components/agent-orchestration/ErrorHandler';
import { 
  Zap, GitBranch, Activity, AlertTriangle, Plus, 
  Layers, TrendingUp 
} from 'lucide-react';

export default function AgentOrchestrationHubPage() {
  const [activeTab, setActiveTab] = useState('orchestrate');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { data: workflows = [] } = useQuery({
    queryKey: ['agent-workflows'],
    queryFn: () => base44.entities.AgentWorkflow?.list?.('-created_date', 50) || []
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution?.list?.('-created_date', 100) || [],
    refetchInterval: 5000
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.AgentDefinition?.list?.('-created_date', 50) || []
  });

  const stats = {
    totalWorkflows: workflows.length,
    activeExecutions: executions.filter(e => e.status === 'running').length,
    successRate: executions.length > 0 
      ? ((executions.filter(e => e.status === 'completed').length / executions.length) * 100).toFixed(1)
      : 0,
    failedRecently: executions.filter(e => 
      e.status === 'failed' && 
      new Date(e.created_date) > new Date(Date.now() - 3600000)
    ).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl blur-3xl" />
          <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl"
              >
                <Layers className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                  Agent Orchestration Hub
                </h1>
                <p className="text-white/60 text-lg">
                  Choreograph multi-agent workflows with precision
                </p>
              </div>
            </div>

            <Button 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Workflows', value: stats.totalWorkflows, icon: GitBranch, color: 'from-blue-500 to-cyan-500' },
            { label: 'Active', value: stats.activeExecutions, icon: Activity, color: 'from-green-500 to-emerald-500' },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
            { label: 'Failed (1h)', value: stats.failedRecently, icon: AlertTriangle, color: 'from-red-500 to-orange-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CinematicCard className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </CinematicCard>
            </motion.div>
          ))}
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/50 border border-white/10 backdrop-blur-xl p-1">
            <TabsTrigger value="orchestrate" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600">
              <Zap className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-green-600">
              <Activity className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="errors" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Errors
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="orchestrate" asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <WorkflowBuilder 
                  workflows={workflows}
                  agents={agents}
                  selectedWorkflow={selectedWorkflow}
                  onSelectWorkflow={setSelectedWorkflow}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="monitor" asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ExecutionMonitor 
                  executions={executions}
                  workflows={workflows}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="errors" asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ErrorHandler executions={executions} />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}