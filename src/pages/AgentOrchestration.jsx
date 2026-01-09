import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEntityList } from "@/components/hooks/useEntity";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bot, GitBranch, MessageSquare, ListTodo, Shield,
  Play, Zap, Network, Settings, Plus
} from "lucide-react";
import AgentRoleManager from "../components/agents/AgentRoleManager";
import AgentCommunicationPanel from "../components/agents/AgentCommunicationPanel";
import WorkflowVisualizer from "../components/agents/WorkflowVisualizer";
import TaskExecutionManager from "../components/agents/TaskExecutionManager";
import WorkflowBuilder from "../components/agents/WorkflowBuilder";
import ActiveCollaborations from "../components/agents/ActiveCollaborations";
import { toast } from "sonner";

export default function AgentOrchestrationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Fetch agents
  const { data: agents = [] } = useEntityList('AgentDefinition');
  const { data: workflows = [] } = useEntityList('AgentWorkflow');
  const { data: collaborations = [] } = useEntityList('AgentCollaboration', {}, '-created_date', 50);
  const { data: tasks = [] } = useEntityList('AgentTask', {}, '-created_date', 100);

  // Start collaboration
  const startCollaboration = useMutation({
    mutationFn: async (workflow) => {
      const collaboration = await base44.entities.AgentCollaboration.create({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status: 'running',
        trigger: 'manual',
        current_step: 0,
        steps: workflow.steps?.map(s => ({ ...s, status: 'pending' })) || [],
        started_at: new Date().toISOString()
      });
      return collaboration;
    },
    onSuccess: (collaboration) => {
      queryClient.invalidateQueries(['agentCollaborations']);
      setSelectedCollaboration(collaboration);
      toast.success("Workflow started");
    }
  });

  // Stats
  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.active).length,
    runningCollaborations: collaborations.filter(c => c.status === 'running').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length
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
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Agent Orchestration
            </h1>
            <p className="text-gray-400">Multi-agent collaboration for complex automation</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 text-gray-400"
              onClick={() => setActiveTab("roles")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Agents
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-pink-500"
              onClick={() => setActiveTab("workflows")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          {[
            { label: "Total Agents", value: stats.totalAgents, icon: Bot, color: "#FF7B00" },
            { label: "Active Agents", value: stats.activeAgents, icon: Zap, color: "#10B981" },
            { label: "Workflows", value: stats.totalWorkflows, icon: GitBranch, color: "#8B5CF6" },
            { label: "Active Flows", value: stats.activeWorkflows, icon: Play, color: "#00B4D8" },
            { label: "Running", value: stats.runningCollaborations, icon: Network, color: "#F59E0B" },
            { label: "Completed", value: stats.completedTasks, icon: ListTodo, color: "#10B981" },
            { label: "Pending", value: stats.pendingTasks, icon: ListTodo, color: "#6B7280" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.03 }}
              className="rounded-xl border border-white/10 p-4"
              style={{ background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500/20">
              <Network className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-orange-500/20">
              <Shield className="w-4 h-4 mr-2" />
              Agent Roles
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-orange-500/20">
              <GitBranch className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-orange-500/20">
              <Play className="w-4 h-4 mr-2" />
              Execution
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-orange-500/20">
              <ListTodo className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-orange-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Communication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Agents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-orange-400" />
                  Active Agents
                </h3>
                <div className="space-y-3">
                  {agents.filter(a => a.status === 'active').slice(0, 5).map(agent => (
                    <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                           style={{ background: `${agent.color}20` }}>
                        <Bot className="w-4 h-4" style={{ color: agent.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.role}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Workflows */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  Available Workflows
                </h3>
                <div className="space-y-3">
                  {workflows.slice(0, 5).map(workflow => (
                    <div key={workflow.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{workflow.name}</p>
                        <p className="text-xs text-gray-400">{workflow.steps?.length || 0} steps</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => startCollaboration.mutate(workflow)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Running Collaborations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Running Collaborations
                </h3>
                <div className="space-y-3">
                  {collaborations.filter(c => c.status === 'running').slice(0, 5).map(collab => (
                    <div 
                      key={collab.id} 
                      className="p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10"
                      onClick={() => {
                        setSelectedCollaboration(collab);
                        setActiveTab('execution');
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">{collab.workflow_name}</p>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Running</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Step {(collab.current_step || 0) + 1} of {collab.steps?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                  {collaborations.filter(c => c.status === 'running').length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No running collaborations</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Active Collaborations List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <ActiveCollaborations 
                collaborations={collaborations} 
                agents={agents.map(a => ({ ...a, icon: Bot }))} 
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="roles">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <AgentRoleManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="workflows">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <WorkflowBuilder agents={agents.map(a => ({ ...a, icon: Bot }))} />
            </motion.div>
          </TabsContent>

          <TabsContent value="execution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Visualizer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                {selectedCollaboration ? (
                  <WorkflowVisualizer
                    workflow={workflows.find(w => w.id === selectedCollaboration.workflow_id)}
                    collaboration={selectedCollaboration}
                    agents={agents}
                    onStart={() => {}}
                    onPause={() => {}}
                    onReset={() => setSelectedCollaboration(null)}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Network className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Select a running collaboration to visualize</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setActiveTab('overview')}
                    >
                      View Collaborations
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Communication Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/10 overflow-hidden h-[600px]"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <AgentCommunicationPanel
                  collaborationId={selectedCollaboration?.id}
                  agents={agents}
                />
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <TaskExecutionManager
                collaborationId={selectedCollaboration?.id}
                agents={agents}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="communication">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 overflow-hidden h-[700px]"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <AgentCommunicationPanel
                collaborationId={selectedCollaboration?.id}
                agents={agents}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}