import React from "react";
import { motion } from "framer-motion";
import { 
  Network, ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Loader2, Eye, MessageSquare, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActiveCollaborations({ collaborations, agents }) {
  // Demo collaborations if none exist
  const demoCollaborations = [
    {
      id: '1',
      workflow_name: 'Security Remediation Pipeline',
      status: 'running',
      started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      trigger: 'vulnerability_detected',
      current_step: 2,
      steps: [
        { agent: 'security-auditor', action: 'scan_vulnerabilities', status: 'completed', duration: '45s' },
        { agent: 'cicd-assistant', action: 'create_branch', status: 'running', duration: '...' },
        { agent: 'cicd-assistant', action: 'trigger_pipeline', status: 'pending' }
      ],
      messages: [
        { agent: 'security-auditor', content: 'Found 2 high-severity vulnerabilities in dependencies', time: '2m ago' },
        { agent: 'cicd-assistant', content: 'Creating fix branch: security/fix-cve-2024-1234', time: '1m ago' }
      ]
    },
    {
      id: '2',
      workflow_name: 'Code Quality Review',
      status: 'completed',
      started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      trigger: 'pull_request_opened',
      current_step: 3,
      steps: [
        { agent: 'code-reviewer', action: 'review_code', status: 'completed', duration: '2m 30s' },
        { agent: 'security-auditor', action: 'scan_vulnerabilities', status: 'completed', duration: '1m 15s' },
        { agent: 'cicd-assistant', action: 'approve_pr', status: 'completed', duration: '5s' }
      ],
      messages: [
        { agent: 'code-reviewer', content: 'Code review passed with 2 suggestions', time: '10m ago' },
        { agent: 'security-auditor', content: 'No vulnerabilities detected', time: '8m ago' },
        { agent: 'cicd-assistant', content: 'PR approved and merged to main', time: '5m ago' }
      ]
    },
    {
      id: '3',
      workflow_name: 'Performance Alert Response',
      status: 'failed',
      started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      trigger: 'performance_degraded',
      current_step: 2,
      steps: [
        { agent: 'performance-analyst', action: 'analyze_metrics', status: 'completed', duration: '30s' },
        { agent: 'cicd-assistant', action: 'rollback_deployment', status: 'failed', error: 'No previous deployment found' }
      ],
      messages: [
        { agent: 'performance-analyst', content: 'Response time increased by 340%', time: '30m ago' },
        { agent: 'cicd-assistant', content: 'Rollback failed: No previous stable deployment', time: '28m ago' }
      ]
    }
  ];

  const displayCollaborations = collaborations.length > 0 ? collaborations : demoCollaborations;

  const getStatusConfig = (status) => ({
    running: { color: '#F59E0B', icon: Loader2, spin: true, text: 'Running' },
    completed: { color: '#10B981', icon: CheckCircle2, text: 'Completed' },
    failed: { color: '#EF4444', icon: XCircle, text: 'Failed' },
    pending: { color: '#6B7280', icon: Clock, text: 'Pending' }
  }[status] || { color: '#6B7280', icon: Clock, text: status });

  const getAgentColor = (agentId) => {
    return agents.find(a => a.id === agentId)?.color || '#6B7280';
  };

  const getAgentName = (agentId) => {
    return agents.find(a => a.id === agentId)?.name || agentId;
  };

  return (
    <div className="space-y-4">
      {displayCollaborations.map((collab, idx) => {
        const statusConfig = getStatusConfig(collab.status);
        const StatusIcon = statusConfig.icon;

        return (
          <motion.div
            key={collab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
              borderColor: `${statusConfig.color}30`
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{ background: `${statusConfig.color}20` }}>
                    <StatusIcon 
                      className={`w-5 h-5 ${statusConfig.spin ? 'animate-spin' : ''}`}
                      style={{ color: statusConfig.color }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{collab.workflow_name}</h4>
                    <p className="text-xs text-gray-400">
                      Triggered by: {collab.trigger.replace(/_/g, ' ')} • Started {new Date(collab.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs font-medium"
                        style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}>
                    {statusConfig.text}
                  </span>
                  <Button size="sm" variant="ghost" className="text-gray-400">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Steps Progress */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                {collab.steps.map((step, i) => {
                  const stepStatus = getStatusConfig(step.status);
                  const StepIcon = stepStatus.icon;

                  return (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                           style={{ background: `${getAgentColor(step.agent)}15` }}>
                        <StepIcon 
                          className={`w-4 h-4 ${stepStatus.spin ? 'animate-spin' : ''}`}
                          style={{ color: stepStatus.color }}
                        />
                        <span className="text-xs text-white">{getAgentName(step.agent)}</span>
                        <span className="text-xs text-gray-500">• {step.action.replace(/_/g, ' ')}</span>
                        {step.duration && step.status !== 'pending' && (
                          <span className="text-xs text-gray-600">{step.duration}</span>
                        )}
                      </div>
                      {i < collab.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Messages */}
              <div className="space-y-2">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Agent Communications
                </div>
                {collab.messages.slice(-3).map((msg, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-white/5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                         style={{ background: getAgentColor(msg.agent), color: 'white' }}>
                      {getAgentName(msg.agent).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white">{msg.content}</p>
                      <p className="text-xs text-gray-500">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error State */}
              {collab.status === 'failed' && collab.steps.find(s => s.error) && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    {collab.steps.find(s => s.error)?.error}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {displayCollaborations.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-white/10 bg-white/5">
          <Network className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Collaborations</h3>
          <p className="text-gray-400">Agent workflows will appear here when triggered</p>
        </div>
      )}
    </div>
  );
}