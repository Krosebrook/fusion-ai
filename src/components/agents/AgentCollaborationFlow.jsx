import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";

export default function AgentCollaborationFlow({ workflow, agents, currentStep = 0 }) {
  const getAgentColor = (agentId) => agents.find(a => a.id === agentId)?.color || '#6B7280';
  const getAgentIcon = (agentId) => agents.find(a => a.id === agentId)?.icon;

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-4">
      {workflow.steps.map((step, idx) => {
        const agent = agents.find(a => a.id === step.agent);
        const AgentIcon = agent?.icon;
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isPending = idx > currentStep;

        return (
          <React.Fragment key={idx}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col items-center p-4 rounded-xl border min-w-[140px] transition-all ${
                isActive ? 'ring-2' : ''
              }`}
              style={{
                background: isCompleted 
                  ? `${getAgentColor(step.agent)}20` 
                  : isPending 
                    ? 'rgba(255,255,255,0.02)' 
                    : `${getAgentColor(step.agent)}15`,
                borderColor: isActive ? getAgentColor(step.agent) : 'rgba(255,255,255,0.1)',
                ringColor: getAgentColor(step.agent)
              }}
            >
              {/* Status Badge */}
              <div className="absolute -top-2 -right-2">
                {isCompleted && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  </div>
                )}
                {isPending && (
                  <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Agent Icon */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${getAgentColor(step.agent)}30` }}
              >
                {AgentIcon && <AgentIcon className="w-5 h-5" style={{ color: getAgentColor(step.agent) }} />}
              </div>

              {/* Agent Name */}
              <p className="text-xs font-medium text-white mb-1">{agent?.name}</p>

              {/* Action */}
              <p className="text-xs text-gray-400 text-center">
                {step.action.replace(/_/g, ' ')}
              </p>

              {/* Output */}
              {step.output && (
                <div className="mt-2 px-2 py-1 rounded bg-white/5 text-xs text-gray-500">
                  → {step.output}
                </div>
              )}
            </motion.div>

            {idx < workflow.steps.length - 1 && (
              <ArrowRight 
                className="w-6 h-6 flex-shrink-0"
                style={{ 
                  color: isCompleted ? getAgentColor(workflow.steps[idx + 1]?.agent) : 'rgba(255,255,255,0.2)' 
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}