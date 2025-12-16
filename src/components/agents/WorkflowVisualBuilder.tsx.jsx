/**
 * Workflow Visual Builder
 * Drag-and-drop visual workflow designer for multi-agent orchestration
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import {
  Plus,
  Play,
  Save,
  Trash2,
  Settings,
  GitBranch,
  ArrowRight,
  Bot,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { agentOrchestrationService, type WorkflowNode, type WorkflowEdge, type AgentRole } from '../services/AgentOrchestrationService';

interface WorkflowVisualBuilderProps {
  workflow?: any;
  agents: AgentRole[];
  onSave: (workflow: any) => void;
}

export function WorkflowVisualBuilder({ workflow, agents, onSave }: WorkflowVisualBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || []);
  const [edges, setEdges] = useState<WorkflowEdge[]>(workflow?.edges || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const addNode = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      agentId: agent.id,
      agentName: agent.name,
      task: `Task for ${agent.name}`,
      dependencies: [],
      timeout: 300,
      retryCount: 0,
    };

    setNodes([...nodes, newNode]);
    toast.success(`Added ${agent.name} to workflow`);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n)));
  };

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const addEdge = (sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      condition: { type: 'always' },
    };

    setEdges([...edges, newEdge]);
  };

  const handleSave = () => {
    const workflowData = {
      ...workflow,
      nodes,
      edges,
    };

    onSave(workflowData);
    toast.success('Workflow saved');
  };

  const handleExecute = async () => {
    try {
      if (!workflow?.id) {
        toast.error('Save workflow first');
        return;
      }

      toast.info('Starting workflow execution...');
      const session = await agentOrchestrationService.startWorkflow(workflow.id);
      toast.success('Workflow started');
    } catch (error) {
      toast.error('Failed to start workflow');
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Agent Palette */}
      <div className="col-span-3 space-y-4 overflow-y-auto">
        <CinematicCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Available Agents
            </h3>
            <div className="space-y-2">
              {agents.map(agent => (
                <motion.button
                  key={agent.id}
                  onClick={() => addNode(agent.id)}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-orange-500/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {agent.name}
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}

              {agents.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No agents configured</p>
                </div>
              )}
            </div>
          </div>
        </CinematicCard>
      </div>

      {/* Canvas */}
      <div className="col-span-6">
        <CinematicCard className="h-full">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Workflow Canvas
              </h3>
              <div className="flex gap-2">
                <CinematicButton
                  variant="secondary"
                  size="sm"
                  icon={Save}
                  onClick={handleSave}
                >
                  Save
                </CinematicButton>
                <CinematicButton
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={handleExecute}
                  glow
                >
                  Execute
                </CinematicButton>
              </div>
            </div>

            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 relative overflow-auto">
              {/* Grid Background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Nodes */}
              <div className="relative p-8 min-h-full">
                {nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute cursor-move"
                    style={{
                      left: `${index * 250 + 50}px`,
                      top: `${Math.floor(index / 3) * 150 + 50}px`,
                    }}
                  >
                    <div
                      className={`bg-slate-800 rounded-xl border-2 p-4 min-w-[200px] transition-all ${
                        selectedNode === node.id
                          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-white font-medium text-sm">
                            {node.agentName}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.id);
                          }}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-xs mb-3">{node.task}</p>
                      <div className="flex gap-2">
                        <CinematicBadge variant="info" size="sm">
                          {node.timeout}s
                        </CinematicBadge>
                        {node.dependencies && node.dependencies.length > 0 && (
                          <CinematicBadge variant="warning" size="sm">
                            {node.dependencies.length} deps
                          </CinematicBadge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Zap className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-lg font-medium mb-2">Empty Canvas</p>
                      <p className="text-sm">
                        Drag agents from the left to build your workflow
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CinematicCard>
      </div>

      {/* Properties Panel */}
      <div className="col-span-3">
        <CinematicCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Node Properties
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                {(() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  if (!node) return null;

                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Agent
                        </label>
                        <p className="text-white">{node.agentName}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Task Description
                        </label>
                        <textarea
                          value={node.task}
                          onChange={(e) => updateNode(node.id, { task: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          value={node.timeout}
                          onChange={(e) =>
                            updateNode(node.id, { timeout: parseInt(e.target.value) || 300 })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Retry Count
                        </label>
                        <input
                          type="number"
                          value={node.retryCount}
                          onChange={(e) =>
                            updateNode(node.id, { retryCount: parseInt(e.target.value) || 0 })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Settings className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">Select a node to edit properties</p>
              </div>
            )}
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}

export default WorkflowVisualBuilder;