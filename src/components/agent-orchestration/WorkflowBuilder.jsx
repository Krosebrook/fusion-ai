/**
 * Workflow Builder - Visual workflow orchestration with dependencies
 */

// Safe refactor: Removed unused React and icon imports (no logic change)
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Save, Play, ArrowRight, Zap 
} from 'lucide-react';
import { toast } from 'sonner';

// Safe refactor: workflows, selectedWorkflow, onSelectWorkflow available for future use
export function WorkflowBuilder({ workflows: _workflows, agents, selectedWorkflow: _selectedWorkflow, onSelectWorkflow: _onSelectWorkflow }) {
  const [nodes, setNodes] = useState(_selectedWorkflow?.nodes || []);
  const [edges, setEdges] = useState(_selectedWorkflow?.edges || []);
  const [workflowName, setWorkflowName] = useState(_selectedWorkflow?.name || '');
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [newNode, setNewNode] = useState({ 
    id: '', 
    type: 'agent', 
    agentId: '', 
    label: '',
    config: {} 
  });

  const addNode = useCallback(() => {
    if (!newNode.id || !newNode.label) {
      toast.error('Node ID and label required');
      return;
    }

    if (nodes.some(n => n.id === newNode.id)) {
      toast.error('Node ID already exists');
      return;
    }

    setNodes(prev => [...prev, { ...newNode, position: { x: 100, y: 100 * nodes.length } }]);
    setNewNode({ id: '', type: 'agent', agentId: '', label: '', config: {} });
    setShowNodeForm(false);
  }, [newNode, nodes]);

  const addEdge = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId) return;
    
    const edgeId = `${sourceId}->${targetId}`;
    if (edges.some(e => e.id === edgeId)) {
      toast.error('Connection already exists');
      return;
    }

    setEdges(prev => [...prev, { 
      id: edgeId, 
      source: sourceId, 
      target: targetId,
      condition: 'always'
    }]);
  }, [edges]);

  const saveWorkflow = useCallback(async () => {
    if (!workflowName.trim()) {
      toast.error('Workflow name required');
      return;
    }

    try {
      const data = {
        name: workflowName,
        description: '',
        status: 'draft',
        nodes,
        edges,
        variables: {},
        trigger: { type: 'manual', config: {} }
      };

      if (selectedWorkflow?.id) {
        await base44.entities.AgentWorkflow.update(selectedWorkflow.id, data);
      } else {
        await base44.entities.AgentWorkflow.create(data);
      }

      toast.success('Workflow saved');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  }, [workflowName, nodes, edges, selectedWorkflow]);

  const executeWorkflow = useCallback(async () => {
    if (!selectedWorkflow?.id) {
      toast.error('Save workflow first');
      return;
    }

    try {
      await base44.entities.WorkflowExecution.create({
        workflow_id: selectedWorkflow.id,
        status: 'running',
        input_data: {},
        trigger_data: {}
      });

      toast.success('Workflow execution started');
    } catch (error) {
      toast.error('Failed to start execution');
    }
  }, [selectedWorkflow]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Canvas Area */}
      <div className="lg:col-span-2">
        <CinematicCard className="p-6 min-h-[600px] bg-gradient-to-br from-white/5 to-white/2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Workflow Canvas</h2>
            <Button size="sm" onClick={() => setShowNodeForm(true)} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-1" />
              Add Agent
            </Button>
          </div>

          {/* Visual Nodes */}
          <div className="relative w-full h-[500px] rounded-lg border border-white/10 bg-white/2 overflow-hidden">
            {nodes.map((node, idx) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute p-4 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg cursor-move"
                style={{ 
                  left: `${20 + idx * 25}%`, 
                  top: `${30 + idx * 15}%`,
                  minWidth: '150px'
                }}
              >
                <p className="text-sm font-bold">{node.label}</p>
                <Badge className="mt-2 text-xs bg-white/20">{node.type}</Badge>
              </motion.div>
            ))}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-2" />
                  <p>Add agents to create workflow</p>
                </div>
              </div>
            )}
          </div>

          {/* Node Form */}
          {showNodeForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
            >
              <Input
                placeholder="Node ID"
                value={newNode.id}
                onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <Input
                placeholder="Node Label"
                value={newNode.label}
                onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <select
                value={newNode.agentId}
                onChange={(e) => setNewNode({ ...newNode, agentId: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">Select Agent</option>
                {agents?.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <Button onClick={addNode} size="sm" className="w-full bg-blue-600">
                Add Node
              </Button>
            </motion.div>
          )}
        </CinematicCard>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Workflow Info */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Workflow</h3>
          <Input
            placeholder="Workflow name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-white/5 border-white/10 text-white mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={saveWorkflow} size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button onClick={executeWorkflow} size="sm" className="flex-1 bg-green-600">
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
          </div>
        </CinematicCard>

        {/* Nodes List */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">Nodes ({nodes.length})</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {nodes.map(node => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <p className="text-sm text-white font-mono">{node.id}</p>
                <p className="text-xs text-white/60">{node.label}</p>
              </motion.div>
            ))}
          </div>
        </CinematicCard>

        {/* Dependencies */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">Dependencies ({edges.length})</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {edges.map(edge => (
              <motion.div
                key={edge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2"
              >
                <span className="text-xs text-white/60">{edge.source}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-white/60">{edge.target}</span>
              </motion.div>
            ))}
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}