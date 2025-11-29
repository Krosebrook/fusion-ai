import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, Zap, GitBranch, Shield, Brain, ArrowRight, Plus, Play, 
  Settings, MessageSquare, Network, Workflow, Sparkles, Clock, FileText, Wand2
} from "lucide-react";
import AgentCollaborationFlow from "../components/agents/AgentCollaborationFlow";
import WorkflowBuilder from "../components/agents/WorkflowBuilder";
import AgentConversation from "../components/agents/AgentConversation";
import ActiveCollaborations from "../components/agents/ActiveCollaborations";
import PromptTemplateManager from "../components/prompt-engineering/PromptTemplateManager";
import PromptExecutor from "../components/prompt-engineering/PromptExecutor";
import DynamicPromptGenerator from "../components/prompt-engineering/DynamicPromptGenerator";

export default function AgentOrchestratorPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("collaborations");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAgentForPrompt, setSelectedAgentForPrompt] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [pipelineContext, setPipelineContext] = useState(null);

  // Fetch user context
  React.useEffect(() => {
    base44.auth.me().then(setUserContext).catch(() => {});
  }, []);

  // Fetch pipeline context
  const { data: pipelineRuns = [] } = useQuery({
    queryKey: ['recentPipelines'],
    queryFn: () => base44.entities.PipelineRun?.list?.('-created_date', 5) || []
  });

  React.useEffect(() => {
    if (pipelineRuns.length > 0) {
      setPipelineContext({
        recent_runs: pipelineRuns.slice(0, 3).map(r => ({
          id: r.id,
          status: r.status,
          branch: r.branch,
          duration: r.duration_seconds
        })),
        success_rate: pipelineRuns.filter(r => r.status === 'success').length / pipelineRuns.length * 100
      });
    }
  }, [pipelineRuns]);

  const { data: workflows = [] } = useQuery({
    queryKey: ['agentWorkflows'],
    queryFn: () => base44.entities.AgentWorkflow?.list?.('-created_date') || []
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['agentCollaborations'],
    queryFn: () => base44.entities.AgentCollaboration?.list?.('-created_date', 20) || []
  });

  const agents = [
    {
      id: 'cicd-assistant',
      name: 'CICDAssistant',
      role: 'DevOps Engineer',
      color: '#FF7B00',
      icon: GitBranch,
      capabilities: ['trigger_pipeline', 'analyze_builds', 'manage_configs', 'optimize_workflows']
    },
    {
      id: 'security-auditor',
      name: 'SecurityAuditor',
      role: 'Security Engineer',
      color: '#8B5CF6',
      icon: Shield,
      capabilities: ['scan_vulnerabilities', 'audit_secrets', 'compliance_check', 'risk_assessment']
    },
    {
      id: 'performance-analyst',
      name: 'PerformanceAnalyst',
      role: 'Performance Engineer',
      color: '#00B4D8',
      icon: Zap,
      capabilities: ['analyze_metrics', 'detect_anomalies', 'predict_issues', 'cost_optimization']
    },
    {
      id: 'code-reviewer',
      name: 'CodeReviewer',
      role: 'Senior Developer',
      color: '#10B981',
      icon: Brain,
      capabilities: ['review_code', 'suggest_improvements', 'check_standards', 'dependency_audit']
    }
  ];

  const presetWorkflows = [
    {
      id: 'security-remediation',
      name: 'Security Remediation Pipeline',
      description: 'SecurityAuditor detects vulnerability → CICDAssistant creates fix branch → triggers secure pipeline',
      agents: ['security-auditor', 'cicd-assistant'],
      trigger: 'vulnerability_detected',
      steps: [
        { agent: 'security-auditor', action: 'scan_vulnerabilities', output: 'vulnerability_report' },
        { agent: 'cicd-assistant', action: 'create_branch', input: 'vulnerability_report', output: 'fix_branch' },
        { agent: 'cicd-assistant', action: 'trigger_pipeline', input: 'fix_branch' }
      ]
    },
    {
      id: 'performance-alert',
      name: 'Performance Degradation Response',
      description: 'PerformanceAnalyst detects issue → CICDAssistant rolls back → notifies team',
      agents: ['performance-analyst', 'cicd-assistant'],
      trigger: 'performance_threshold_exceeded',
      steps: [
        { agent: 'performance-analyst', action: 'analyze_metrics', output: 'performance_report' },
        { agent: 'cicd-assistant', action: 'rollback_deployment', input: 'performance_report' },
        { agent: 'cicd-assistant', action: 'notify_team', input: 'rollback_result' }
      ]
    },
    {
      id: 'code-security-review',
      name: 'Secure Code Review Pipeline',
      description: 'CodeReviewer analyzes PR → SecurityAuditor scans for vulnerabilities → auto-approve or flag',
      agents: ['code-reviewer', 'security-auditor', 'cicd-assistant'],
      trigger: 'pull_request_opened',
      steps: [
        { agent: 'code-reviewer', action: 'review_code', output: 'code_review' },
        { agent: 'security-auditor', action: 'scan_vulnerabilities', input: 'code_review', output: 'security_scan' },
        { agent: 'cicd-assistant', action: 'approve_or_flag', input: 'security_scan' }
      ]
    }
  ];

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
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Agent Orchestrator
            </h1>
            <p className="text-gray-400">Multi-agent collaboration for intelligent automation</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setActiveTab("workflows")}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </motion.div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 p-4 hover:border-white/30 transition-all cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${agent.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ background: `${agent.color}20` }}>
                  <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map(cap => (
                  <span key={cap} className="px-2 py-0.5 rounded text-xs"
                        style={{ background: `${agent.color}15`, color: agent.color }}>
                    {cap.replace('_', ' ')}
                  </span>
                ))}
                {agent.capabilities.length > 2 && (
                  <span className="text-xs text-gray-500">+{agent.capabilities.length - 2}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="collaborations" className="data-[state=active]:bg-orange-500/20">
              <Network className="w-4 h-4 mr-2" />
              Active Collaborations
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-orange-500/20">
              <Workflow className="w-4 h-4 mr-2" />
              Workflow Builder
            </TabsTrigger>
            <TabsTrigger value="presets" className="data-[state=active]:bg-orange-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Preset Workflows
            </TabsTrigger>
            <TabsTrigger value="conversation" className="data-[state=active]:bg-orange-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Agent Chat
            </TabsTrigger>
            <TabsTrigger value="prompts" className="data-[state=active]:bg-purple-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Prompt Engineering
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collaborations">
            <ActiveCollaborations collaborations={collaborations} agents={agents} />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowBuilder agents={agents} />
          </TabsContent>

          <TabsContent value="presets">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {presetWorkflows.map((workflow, idx) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl border border-white/10 p-6"
                  style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{workflow.name}</h3>
                      <p className="text-sm text-gray-400">{workflow.description}</p>
                    </div>
                  </div>

                  {/* Agent Flow */}
                  <div className="flex items-center gap-2 mb-4">
                    {workflow.agents.map((agentId, i) => {
                      const agent = agents.find(a => a.id === agentId);
                      return (
                        <React.Fragment key={agentId}>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                               style={{ background: `${agent?.color}20` }}>
                            {agent?.icon && <agent.icon className="w-4 h-4" style={{ color: agent?.color }} />}
                            <span className="text-xs text-white">{agent?.name}</span>
                          </div>
                          {i < workflow.agents.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Steps */}
                  <div className="space-y-2 mb-4">
                    {workflow.steps.map((step, i) => {
                      const agent = agents.find(a => a.id === step.agent);
                      return (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                                style={{ background: agent?.color }}>
                            {i + 1}
                          </span>
                          <span className="text-gray-300">{step.action.replace('_', ' ')}</span>
                          {step.output && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-500">{step.output}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">
                    <Play className="w-4 h-4 mr-2" />
                    Activate Workflow
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversation">
            <AgentConversation agents={agents} />
          </TabsContent>

          <TabsContent value="prompts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Template Manager & Generator */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/10 p-6"
                  style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
                >
                  <PromptTemplateManager 
                    onSelectTemplate={setSelectedTemplate}
                    selectedAgent={selectedAgentForPrompt}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-white/10 p-6"
                  style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
                >
                  <DynamicPromptGenerator 
                    agentId={selectedAgentForPrompt}
                    onGenerated={(template) => setSelectedTemplate(template)}
                  />
                </motion.div>
              </div>

              {/* Right: Prompt Executor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 p-6"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
              >
                <PromptExecutor 
                  template={selectedTemplate}
                  userContext={userContext}
                  pipelineContext={pipelineContext}
                  environmentContext={{ env: 'production' }}
                />
              </motion.div>
            </div>

            {/* Agent Quick Select */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-xl border border-white/10 p-4"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <h4 className="text-sm font-medium text-white mb-3">Filter by Agent</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAgentForPrompt(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    !selectedAgentForPrompt ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  All Agents
                </button>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentForPrompt(agent.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all ${
                      selectedAgentForPrompt === agent.id 
                        ? 'border' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                    style={selectedAgentForPrompt === agent.id ? {
                      background: `${agent.color}20`,
                      color: agent.color,
                      borderColor: `${agent.color}50`
                    } : {}}
                  >
                    <agent.icon className="w-3 h-3" />
                    {agent.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}