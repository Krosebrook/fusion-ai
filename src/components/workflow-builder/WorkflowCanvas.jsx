/**
 * Workflow Canvas - Visual workflow builder with ReactFlow
 */

import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { CinematicButton } from '../atoms/CinematicButton';
import { Plus, Play, Save, Settings, Package, Layers, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { TriggerNode } from './nodes/TriggerNode';
import { AITaskNode } from './nodes/AITaskNode';
import { APICallNode } from './nodes/APICallNode';
import { ConditionNode } from './nodes/ConditionNode';
import { TransformNode } from './nodes/TransformNode';
import { EndNode } from './nodes/EndNode';
import { ComponentNode } from './nodes/ComponentNode';
import { ComponentLibrary } from './ComponentLibrary';
import { CreateComponentDialog } from './CreateComponentDialog';
import { AIComponentBuilder } from './AIComponentBuilder';
import { OptimizationPanel } from './OptimizationPanel';
import { WorkflowAnalyticsPanel } from './WorkflowAnalyticsPanel';

const nodeTypes = {
  trigger: TriggerNode,
  ai_task: AITaskNode,
  api_call: APICallNode,
  condition: ConditionNode,
  transform: TransformNode,
  end: EndNode,
  component: ComponentNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#8a5cff',
  },
  style: {
    strokeWidth: 2,
    stroke: '#8a5cff',
  },
};

export function WorkflowCanvas({ workflow, onSave, onExecute }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showCreateComponent, setShowCreateComponent] = useState(false);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - 100,
        y: event.clientY - 50,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.replace('_', ' ')}`,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleSave = () => {
    onSave({ nodes, edges });
  };

  const handleExecute = () => {
    onExecute({ nodes, edges });
  };

  const addNode = (type) => {
    const position = {
      x: Math.random() * 400,
      y: Math.random() * 300,
    };

    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        config: {},
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setShowNodeMenu(false);
  };

  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes);
  }, []);

  const handleCreateComponent = () => {
    if (selectedNodes.length === 0) {
      toast.error('Select nodes to create a component');
      return;
    }

    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdgesForComponent = edges.filter(e => 
      selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    setShowCreateComponent(true);
  };

  const handleAIGenerate = async (componentDef) => {
    if (!componentDef?.name || !componentDef?.nodes) {
      toast.error('Invalid component definition');
      return;
    }

    try {
      const created = await base44.entities.WorkflowComponent.create({
        name: componentDef.name,
        description: componentDef.description || '',
        category: componentDef.category || 'custom',
        icon: componentDef.icon || '📦',
        color: componentDef.color || 'from-purple-500 to-pink-600',
        nodes: componentDef.nodes,
        edges: componentDef.edges || [],
        inputs: componentDef.inputs || [],
        outputs: componentDef.outputs || [],
        tags: componentDef.tags || [],
        version: '1.0.0',
        usage_count: 0,
      });

      toast.success(`✨ "${componentDef.name}" added to canvas`);
      
      // Add component to canvas at center
      const position = {
        x: 250 + Math.random() * 100,
        y: 150 + Math.random() * 100,
      };

      const newNode = {
        id: `component-${Date.now()}`,
        type: 'component',
        position,
        data: {
          label: componentDef.name,
          componentId: created.id,
          inputs: componentDef.inputs || [],
          outputs: componentDef.outputs || [],
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setShowAIBuilder(false);
    } catch (error) {
      console.error('Failed to create AI component', error);
      toast.error(`Failed to save component: ${error.message || 'Unknown error'}`);
    }
  };

  const nodeMenuItems = [
    { type: 'trigger', label: 'Trigger', icon: '▶️' },
    { type: 'ai_task', label: 'AI Task', icon: '🤖' },
    { type: 'api_call', label: 'API Call', icon: '🔌' },
    { type: 'condition', label: 'Condition', icon: '❓' },
    { type: 'transform', label: 'Transform', icon: '⚙️' },
    { type: 'end', label: 'End', icon: '🏁' },
  ];

  return (
    <div className="relative h-full w-full">
      {/* Toolbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.10] border border-white/[0.18] backdrop-blur-[18px] shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
          <div className="relative">
            <CinematicButton
              variant="glass"
              icon={Plus}
              onClick={() => setShowNodeMenu(!showNodeMenu)}
            >
              Add Node
            </CinematicButton>

            {showNodeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                {nodeMenuItems.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addNode(item.type)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="w-px h-8 bg-white/10" />

          <CinematicButton
            variant="glass"
            icon={Sparkles}
            onClick={() => setShowAIBuilder(true)}
          >
            AI Build
          </CinematicButton>

          <CinematicButton
            variant="glass"
            icon={Package}
            onClick={() => setShowComponentLibrary(true)}
          >
            Library
          </CinematicButton>

          <CinematicButton
            variant="glass"
            icon={Layers}
            onClick={handleCreateComponent}
            disabled={selectedNodes.length === 0}
          >
            Component
          </CinematicButton>

          <div className="w-px h-8 bg-white/10" />

          <CinematicButton
            variant="glass"
            icon={TrendingUp}
            onClick={() => setShowOptimization(true)}
            disabled={nodes.length === 0}
          >
            Optimize
          </CinematicButton>

          <CinematicButton
            variant="glass"
            icon={BarChart3}
            onClick={() => setShowAnalytics(true)}
            disabled={!workflow?.id}
          >
            Analytics
          </CinematicButton>

          <div className="w-px h-8 bg-white/10" />

          <CinematicButton
            variant="glass"
            icon={Save}
            onClick={handleSave}
          >
            Save
          </CinematicButton>

          <CinematicButton
            variant="primary"
            icon={Play}
            onClick={handleExecute}
            glow
          >
            Execute
          </CinematicButton>
        </div>
      </motion.div>

      {/* ReactFlow Canvas */}
      <div ref={reactFlowWrapper} className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-slate-950"
        >
          <Background 
            color="#8a5cff" 
            gap={16} 
            size={1}
            style={{ opacity: 0.1 }}
          />
          <Controls 
            className="!bg-white/10 !border-white/20 !backdrop-blur-md"
            style={{
              button: {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }
            }}
          />
          <MiniMap 
            nodeColor={(node) => {
              const colors = {
                trigger: '#10b981',
                ai_task: '#8a5cff',
                api_call: '#3b82f6',
                condition: '#f59e0b',
                transform: '#06b6d4',
                end: '#ef4444',
              };
              return colors[node.type] || '#6b7280';
            }}
            className="!bg-slate-900/90 !border-white/20"
          />
        </ReactFlow>
      </div>

      {showAIBuilder && (
        <AIComponentBuilder
          onGenerate={handleAIGenerate}
          onClose={() => setShowAIBuilder(false)}
        />
      )}

      {showComponentLibrary && (
        <ComponentLibrary
          onAddComponent={(comp) => console.log('Add', comp)}
          onClose={() => setShowComponentLibrary(false)}
        />
      )}

      {showOptimization && (
        <OptimizationPanel
          workflow={{ nodes, edges }}
          onApplyOptimization={(optimizedWorkflow) => {
            setNodes(optimizedWorkflow.nodes || []);
            setEdges(optimizedWorkflow.edges || []);
            setShowOptimization(false);
          }}
          onClose={() => setShowOptimization(false)}
        />
      )}

      {showAnalytics && workflow?.id && (
        <WorkflowAnalyticsPanel
          workflow={workflow}
          onClose={() => setShowAnalytics(false)}
          onApplyFix={() => {
            setShowAnalytics(false);
            onSave?.({ nodes, edges });
          }}
        />
      )}

      {showCreateComponent && (
        <CreateComponentDialog
          selectedNodes={selectedNodes}
          selectedEdges={edges.filter(e => 
            selectedNodes.some(n => n.id === e.source) && 
            selectedNodes.some(n => n.id === e.target)
          )}
          onClose={() => setShowCreateComponent(false)}
          onCreated={() => setSelectedNodes([])}
        />
      )}
    </div>
  );
}

export default WorkflowCanvas;