import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, GitBranch, Zap, Plus, Trash2, Play, Settings } from 'lucide-react';
import { NodeConfigDialog } from './NodeConfigDialog';

const AGENT_NODES = [
  { id: 'scaffolder', name: 'Scaffolder', icon: '🏗️', color: 'purple', type: 'agent' },
  { id: 'tester', name: 'Tester', icon: '🧪', color: 'green', type: 'agent' },
  { id: 'reviewer', name: 'Reviewer', icon: '🔍', color: 'blue', type: 'agent' },
  { id: 'documenter', name: 'Documenter', icon: '📝', color: 'orange', type: 'agent' }
];

const LOGIC_NODES = [
  { id: 'condition', name: 'Condition', icon: '⚡', color: 'yellow', type: 'logic' },
  { id: 'parallel', name: 'Parallel', icon: '🔀', color: 'cyan', type: 'logic' },
  { id: 'merge', name: 'Merge', icon: '🔗', color: 'pink', type: 'logic' }
];

export function VisualPipelineEditor({ onSave }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const nodeType = [...AGENT_NODES, ...LOGIC_NODES].find(n => n.id === result.draggableId);
      const newNode = {
        id: `${nodeType.id}-${Date.now()}`,
        type: nodeType.type,
        agentId: nodeType.id,
        name: nodeType.name,
        icon: nodeType.icon,
        color: nodeType.color,
        config: {},
        position: destination.index
      };
      setNodes(prev => [...prev, newNode]);
    } else if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      const reordered = Array.from(nodes);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setNodes(reordered);
    }
  }, [nodes]);

  const removeNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  const executeWorkflow = () => {
    onSave?.(nodes);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Agent Palette */}
        <div className="col-span-3 space-y-4">
          <GlassmorphicCard className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Agent Nodes</h3>
            <Droppable droppableId="palette" isDropDisabled={true}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {AGENT_NODES.map((node, idx) => (
                    <Draggable key={node.id} draggableId={node.id} index={idx}>
                      {(provided, snapshot) => (
                        <>
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            whileHover={{ scale: 1.05 }}
                            className={`p-3 rounded-lg border border-${node.color}-500/20 bg-${node.color}-500/10 cursor-move ${snapshot.isDragging ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{node.icon}</span>
                              <span className="text-sm font-medium text-white">{node.name}</span>
                            </div>
                          </motion.div>
                          {snapshot.isDragging && (
                            <div className={`p-3 rounded-lg border border-${node.color}-500/20 bg-${node.color}-500/10`}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{node.icon}</span>
                                <span className="text-sm font-medium text-white">{node.name}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-4">
            <h3 className="text-sm font-bold text-white mb-3">Logic Nodes</h3>
            <Droppable droppableId="logic-palette" isDropDisabled={true}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {LOGIC_NODES.map((node, idx) => (
                    <Draggable key={node.id} draggableId={node.id} index={idx + 100}>
                      {(provided, snapshot) => (
                        <>
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            whileHover={{ scale: 1.05 }}
                            className={`p-3 rounded-lg border border-${node.color}-500/20 bg-${node.color}-500/10 cursor-move`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{node.icon}</span>
                              <span className="text-sm font-medium text-white">{node.name}</span>
                            </div>
                          </motion.div>
                          {snapshot.isDragging && (
                            <div className={`p-3 rounded-lg border border-${node.color}-500/20 bg-${node.color}-500/10`}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{node.icon}</span>
                                <span className="text-sm font-medium text-white">{node.name}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </GlassmorphicCard>
        </div>

        {/* Pipeline Canvas */}
        <div className="col-span-9">
          <GlassmorphicCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Workflow Pipeline</h3>
              <Button onClick={executeWorkflow} className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Play className="w-4 h-4 mr-2" />
                Execute Workflow
              </Button>
            </div>

            <Droppable droppableId="canvas">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] border-2 border-dashed rounded-xl p-6 transition-colors ${
                    snapshot.isDraggingOver ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'
                  }`}
                >
                  {nodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-16 h-16 text-gray-600 mb-4" />
                      <p className="text-gray-400">Drag agents here to build your workflow</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nodes.map((node, idx) => (
                        <Draggable key={node.id} draggableId={node.id} index={idx}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <div className={`p-4 rounded-xl border border-${node.color}-500/30 bg-${node.color}-500/10 relative`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className={`bg-${node.color}-500/20 text-${node.color}-400 border-${node.color}-500/30`}>
                                      {idx + 1}
                                    </Badge>
                                    <span className="text-2xl">{node.icon}</span>
                                    <div>
                                      <div className="text-sm font-bold text-white">{node.name}</div>
                                      {node.type === 'logic' && (
                                        <div className="text-xs text-gray-400">Logic Node</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedNode(node)} className="text-gray-400">
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeNode(node.id)} className="text-red-400">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                {node.config?.condition && (
                                  <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-xs text-gray-400">
                                      Condition: <span className="text-white font-mono">{node.config.condition}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {idx < nodes.length - 1 && (
                                <div className="flex justify-center py-2">
                                  <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500/50 to-transparent" />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </GlassmorphicCard>
        </div>
      </div>

      {selectedNode && (
        <NodeConfigDialog
          node={selectedNode}
          onSave={(config) => {
            setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config } : n));
            setSelectedNode(null);
          }}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </DragDropContext>
  );
}