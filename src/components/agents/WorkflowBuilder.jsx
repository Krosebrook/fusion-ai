import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Trash2, ArrowRight, Play, Save, Settings, Zap, 
  GitBranch, Shield, Brain, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function WorkflowBuilder({ agents }) {
  const queryClient = useQueryClient();
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    steps: []
  });

  const triggers = [
    { value: 'manual', label: 'Manual Trigger' },
    { value: 'vulnerability_detected', label: 'Vulnerability Detected' },
    { value: 'pipeline_failed', label: 'Pipeline Failed' },
    { value: 'pull_request_opened', label: 'Pull Request Opened' },
    { value: 'deployment_completed', label: 'Deployment Completed' },
    { value: 'performance_degraded', label: 'Performance Degraded' },
    { value: 'secret_expired', label: 'Secret Expired' },
    { value: 'schedule', label: 'Scheduled (Cron)' }
  ];

  const agentActions = {
    'cicd-assistant': [
      'trigger_pipeline', 'create_branch', 'rollback_deployment', 
      'notify_team', 'approve_pr', 'merge_branch', 'analyze_build'
    ],
    'security-auditor': [
      'scan_vulnerabilities', 'audit_secrets', 'compliance_check',
      'risk_assessment', 'generate_report', 'block_deployment'
    ],
    'performance-analyst': [
      'analyze_metrics', 'detect_anomalies', 'predict_issues',
      'cost_analysis', 'recommend_scaling', 'generate_report'
    ],
    'code-reviewer': [
      'review_code', 'check_standards', 'suggest_improvements',
      'dependency_audit', 'complexity_analysis', 'approve_or_flag'
    ]
  };

  const addStep = () => {
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, {
        id: Date.now(),
        agent: agents[0]?.id || '',
        action: '',
        condition: '',
        output_variable: ''
      }]
    });
  };

  const updateStep = (index, field, value) => {
    const updated = [...workflow.steps];
    updated[index] = { ...updated[index], [field]: value };
    setWorkflow({ ...workflow, steps: updated });
  };

  const removeStep = (index) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter((_, i) => i !== index)
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Would save to AgentWorkflow entity
      console.log('Saving workflow:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agentWorkflows']);
    }
  });

  const getAgentColor = (agentId) => {
    return agents.find(a => a.id === agentId)?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Workflow Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Workflow Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white mb-2 block">Workflow Name</Label>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="e.g., Security Auto-Remediation"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">Trigger Event</Label>
            <Select 
              value={workflow.trigger} 
              onValueChange={(v) => setWorkflow({ ...workflow, trigger: v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {triggers.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-white">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-white mb-2 block">Description</Label>
          <Input
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            placeholder="Describe what this workflow does..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </motion.div>

      {/* Steps Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            Workflow Steps
          </h3>
          <Button onClick={addStep} size="sm" className="bg-orange-500/20 text-orange-400">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          {workflow.steps.map((step, index) => {
            const agent = agents.find(a => a.id === step.agent);
            const actions = agentActions[step.agent] || [];

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 p-4 rounded-lg border"
                style={{
                  background: `${getAgentColor(step.agent)}10`,
                  borderColor: `${getAgentColor(step.agent)}30`
                }}
              >
                {/* Step Number */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                       style={{ background: getAgentColor(step.agent) }}>
                    {index + 1}
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="w-0.5 h-8 mt-2" style={{ background: getAgentColor(step.agent) }} />
                  )}
                </div>

                {/* Step Config */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Agent</Label>
                    <Select 
                      value={step.agent} 
                      onValueChange={(v) => updateStep(index, 'agent', v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {agents.map(a => (
                          <SelectItem key={a.id} value={a.id} className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                              {a.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Action</Label>
                    <Select 
                      value={step.action} 
                      onValueChange={(v) => updateStep(index, 'action', v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {actions.map(action => (
                          <SelectItem key={action} value={action} className="text-white">
                            {action.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Output Variable</Label>
                    <Input
                      value={step.output_variable}
                      onChange={(e) => updateStep(index, 'output_variable', e.target.value)}
                      placeholder="e.g., scan_result"
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStep(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}

          {workflow.steps.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
              <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No steps defined yet</p>
              <Button onClick={addStep} className="bg-orange-500/20 text-orange-400">
                <Plus className="w-4 h-4 mr-2" />
                Add First Step
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-white/10">
          Preview Flow
        </Button>
        <Button
          onClick={() => saveMutation.mutate(workflow)}
          disabled={!workflow.name || workflow.steps.length === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Workflow
        </Button>
      </div>
    </div>
  );
}