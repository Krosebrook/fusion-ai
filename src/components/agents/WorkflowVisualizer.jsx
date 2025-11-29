import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, ArrowRight, Play, Pause, RotateCcw, CheckCircle2,
  AlertCircle, Clock, Loader2, Zap, GitBranch, Circle
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: '#6B7280', icon: Circle, pulse: false },
  running: { color: '#F59E0B', icon: Loader2, pulse: true },
  completed: { color: '#10B981', icon: CheckCircle2, pulse: false },
  failed: { color: '#EF4444', icon: AlertCircle, pulse: false },
  waiting: { color: '#8B5CF6', icon: Clock, pulse: true }
};

export default function WorkflowVisualizer({ 
  workflow, 
  collaboration,
  agents = [],
  onStart,
  onPause,
  onReset
}) {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = useMemo(() => {
    if (!workflow?.steps) return [];
    
    return workflow.steps.map((step, idx) => {
      const collaborationStep = collaboration?.steps?.[idx];
      const agent = agents.find(a => a.id === step.agent || a.slug === step.agent);
      
      return {
        ...step,
        index: idx,
        agent: agent || { name: step.agent, color: '#6B7280' },
        status: collaborationStep?.status || 'pending',
        duration: collaborationStep?.duration,
        output: collaborationStep?.output,
        error: collaborationStep?.error
      };
    });
  }, [workflow, collaboration, agents]);

  const currentStepIndex = collaboration?.current_step || 0;
  const isRunning = collaboration?.status === 'running';

  const getAgentPosition = (agentId) => {
    const agentSteps = steps.filter(s => s.agent.id === agentId || s.agent.slug === agentId);
    return agentSteps.map(s => s.index);
  };

  // Group steps by agent for swim lane view
  const agentLanes = useMemo(() => {
    const lanes = {};
    steps.forEach(step => {
      const agentKey = step.agent.id || step.agent.slug || step.agent.name;
      if (!lanes[agentKey]) {
        lanes[agentKey] = { agent: step.agent, steps: [] };
      }
      lanes[agentKey].steps.push(step);
    });
    return Object.values(lanes);
  }, [steps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-orange-400" />
            {workflow?.name || 'Workflow Execution'}
          </h3>
          <p className="text-sm text-gray-400">{workflow?.description}</p>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              size="sm"
              onClick={onStart}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onPause}
              className="bg-yellow-500"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="border-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-white/10 rounded-full">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + (isRunning ? 0.5 : 0)) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between relative pt-4">
          {steps.map((step, idx) => {
            const StatusIcon = STATUS_CONFIG[step.status]?.icon || Circle;
            const statusConfig = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
            const isCurrent = idx === currentStepIndex && isRunning;

            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center relative z-10"
                style={{ width: `${100 / steps.length}%` }}
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Node */}
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    isCurrent ? 'scale-110' : ''
                  }`}
                  style={{
                    background: `${step.agent.color}20`,
                    borderColor: isCurrent ? step.agent.color : statusConfig.color,
                    boxShadow: isCurrent ? `0 0 20px ${step.agent.color}40` : 'none'
                  }}
                  animate={statusConfig.pulse ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Bot className="w-5 h-5" style={{ color: step.agent.color }} />
                </motion.div>

                {/* Status Badge */}
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: statusConfig.color }}
                >
                  <StatusIcon className={`w-3 h-3 text-white ${step.status === 'running' ? 'animate-spin' : ''}`} />
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-white">{step.agent.name}</p>
                  <p className="text-xs text-gray-400">{step.action}</p>
                  {step.duration && (
                    <p className="text-xs text-gray-500 mt-1">{step.duration}</p>
                  )}
                </div>

                {/* Hover Tooltip */}
                {hoveredStep === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 p-3 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-sm z-20 min-w-[200px]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Status</span>
                        <Badge style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}>
                          {step.status}
                        </Badge>
                      </div>
                      {step.input_variable && (
                        <div>
                          <span className="text-xs text-gray-400">Input: </span>
                          <code className="text-xs text-orange-400">{step.input_variable}</code>
                        </div>
                      )}
                      {step.output_variable && (
                        <div>
                          <span className="text-xs text-gray-400">Output: </span>
                          <code className="text-xs text-green-400">{step.output_variable}</code>
                        </div>
                      )}
                      {step.error && (
                        <div className="text-xs text-red-400 mt-2">{step.error}</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Connector Arrow */}
                {idx < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-600" style={{ marginLeft: '100%' }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Swim Lane View */}
      <div className="mt-8 space-y-4">
        <h4 className="text-sm font-medium text-gray-400">Agent Swim Lanes</h4>
        {agentLanes.map((lane, laneIdx) => (
          <motion.div
            key={laneIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: laneIdx * 0.1 }}
            className="flex items-center gap-4"
          >
            {/* Agent Label */}
            <div className="w-32 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${lane.agent.color}20` }}
              >
                <Bot className="w-4 h-4" style={{ color: lane.agent.color }} />
              </div>
              <span className="text-sm text-white truncate">{lane.agent.name}</span>
            </div>

            {/* Steps */}
            <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-white/5">
              {steps.map((step, stepIdx) => {
                const isThisAgent = (step.agent.id === lane.agent.id) || 
                                   (step.agent.slug === lane.agent.slug) ||
                                   (step.agent.name === lane.agent.name);
                const statusConfig = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;

                return (
                  <div
                    key={stepIdx}
                    className={`h-8 flex-1 rounded flex items-center justify-center text-xs transition-all ${
                      isThisAgent ? 'cursor-pointer' : 'opacity-20'
                    }`}
                    style={{
                      background: isThisAgent ? `${statusConfig.color}30` : 'transparent',
                      border: isThisAgent ? `1px solid ${statusConfig.color}50` : '1px solid transparent'
                    }}
                  >
                    {isThisAgent && (
                      <span className="text-white">{step.action}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Execution Stats */}
      {collaboration && (
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{steps.filter(s => s.status === 'completed').length}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{steps.filter(s => s.status === 'running').length}</p>
            <p className="text-xs text-gray-400">Running</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{steps.filter(s => s.status === 'pending').length}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{steps.filter(s => s.status === 'failed').length}</p>
            <p className="text-xs text-gray-400">Failed</p>
          </div>
        </div>
      )}
    </div>
  );
}