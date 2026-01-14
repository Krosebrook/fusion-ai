import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Plus, Trash2, Play, Save, ArrowRight, Settings, AlertCircle, CheckCircle2, GitMerge } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { toast } from 'sonner';

export function ChainBuilderAdvanced({ onSave, existingChain, onDebug }) {
  const [chain, setChain] = useState(existingChain || {
    name: '',
    description: '',
    execution_mode: 'sequential',
    nodes: [{
      id: 'node_1',
      name: 'Entry Node',
      type: 'prompt',
      config: {
        prompt_template_id: '',
        timeout_ms: 30000,
        retry_count: 0,
        cache_ttl_seconds: 0
      },
      input_mapping: {},
      output_variable: 'result_1',
      position: { x: 100, y: 100 }
    }],
    edges: [],
    error_handling: {
      on_node_error: 'stop',
      max_retries: 3,
      retry_delay_ms: 1000
    }
  });

  const addNode = (type = 'prompt') => {
    const newNode = {
      id: `node_${chain.nodes.length + 1}`,
      name: `${type} Node ${chain.nodes.length + 1}`,
      type,
      config: {
        timeout_ms: 30000,
        retry_count: 0
      },
      input_mapping: {},
      output_variable: `result_${chain.nodes.length + 1}`,
      position: { x: 100, y: 100 + (chain.nodes.length * 150) }
    };
    setChain({ ...chain, nodes: [...chain.nodes, newNode] });
  };

  const updateNode = (nodeId, updates) => {
    setChain({
      ...chain,
      nodes: chain.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    });
  };

  const removeNode = (nodeId) => {
    setChain({
      ...chain,
      nodes: chain.nodes.filter(n => n.id !== nodeId),
      edges: chain.edges.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId)
    });
  };

  const addEdge = (sourceId, targetId, conditionType = 'always') => {
    const newEdge = {
      id: `edge_${chain.edges.length + 1}`,
      source_node_id: sourceId,
      target_node_id: targetId,
      condition: {
        type: conditionType,
        expression: ''
      },
      label: ''
    };
    setChain({ ...chain, edges: [...chain.edges, newEdge] });
  };

  const validateChain = () => {
    if (!chain.name?.trim()) {
      toast.error('Chain name is required');
      return false;
    }
    if (chain.nodes.length === 0) {
      toast.error('Chain must have at least one node');
      return false;
    }
    // Check for orphaned nodes
    const connectedNodes = new Set(chain.edges.flatMap(e => [e.source_node_id, e.target_node_id]));
    if (chain.nodes.length > 1 && connectedNodes.size < chain.nodes.length) {
      toast.error('All nodes must be connected');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateChain()) return;
    onSave(chain);
  };

  return (
    <div className="space-y-6">
      {/* Chain Settings */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Advanced Chain Builder</h3>
            <p className="text-white/60 text-sm">Build complex multi-step workflows with conditional logic</p>
          </div>
          <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-600">
            <Save className="w-4 h-4 mr-2" />
            Save Chain
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white mb-2">Chain Name</Label>
            <Input
              value={chain.name}
              onChange={(e) => setChain({ ...chain, name: e.target.value })}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2">Execution Mode</Label>
            <Select value={chain.execution_mode} onValueChange={(v) => setChain({ ...chain, execution_mode: v })}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="sequential">Sequential</SelectItem>
                <SelectItem value="streaming">Streaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white mb-2">Error Handling</Label>
            <Select 
              value={chain.error_handling?.on_node_error || 'stop'} 
              onValueChange={(v) => setChain({ 
                ...chain, 
                error_handling: { ...chain.error_handling, on_node_error: v }
              })}
            >
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="stop">Stop on Error</SelectItem>
                <SelectItem value="continue">Continue</SelectItem>
                <SelectItem value="retry">Retry</SelectItem>
                <SelectItem value="fallback">Use Fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CinematicCard>

      {/* Node Types */}
      <CinematicCard className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Add Node</h4>
        <div className="flex flex-wrap gap-2">
          {['prompt', 'condition', 'parallel', 'transform', 'function', 'loop'].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              size="sm"
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
            >
              <Plus className="w-3 h-3 mr-2" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </CinematicCard>

      {/* Empty State */}
      {chain.nodes.length === 0 && (
        <CinematicCard className="p-12 text-center">
          <GitBranch className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-bold text-white mb-2">No Nodes Yet</h3>
          <p className="text-white/60 mb-4">Add nodes above to start building your chain</p>
        </CinematicCard>
      )}

      {/* Nodes */}
      <div className="space-y-4">
        {chain.nodes.map((node, idx) => (
          <CinematicCard key={node.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <Badge className={`${
                  node.type === 'condition' ? 'bg-orange-500/20 text-orange-400' :
                  node.type === 'parallel' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-purple-500/20 text-purple-400'
                } border-0`}>
                  {node.type}
                </Badge>
                <Input
                  value={node.name}
                  onChange={(e) => updateNode(node.id, { name: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white flex-1"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeNode(node.id)}
                className="text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Node Configuration */}
              {node.type === 'prompt' && (
                <div>
                  <Label className="text-white/60 text-xs mb-1">Template ID</Label>
                  <Input
                    value={node.config?.prompt_template_id || ''}
                    onChange={(e) => updateNode(node.id, {
                      config: { ...node.config, prompt_template_id: e.target.value }
                    })}
                    placeholder="prompt_template_id"
                    className="bg-slate-900/50 border-white/10 text-white text-sm"
                  />
                </div>
              )}

              {node.type === 'condition' && (
                <div className="md:col-span-2">
                  <Label className="text-white/60 text-xs mb-1">Condition Expression</Label>
                  <Input
                    value={node.config?.condition_expression || ''}
                    onChange={(e) => updateNode(node.id, {
                      config: { ...node.config, condition_expression: e.target.value }
                    })}
                    placeholder="e.g., result_1.status === 'success'"
                    className="bg-slate-900/50 border-white/10 text-white text-sm font-mono"
                  />
                </div>
              )}

              {node.type === 'parallel' && (
                <div className="md:col-span-2">
                  <Label className="text-white/60 text-xs mb-1">
                    <GitMerge className="w-3 h-3 inline mr-1" />
                    Parallel Node IDs (comma-separated)
                  </Label>
                  <Input
                    value={(node.config?.parallel_nodes || []).join(', ')}
                    onChange={(e) => updateNode(node.id, {
                      config: { 
                        ...node.config, 
                        parallel_nodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    })}
                    placeholder="node_2, node_3, node_4"
                    className="bg-slate-900/50 border-white/10 text-white text-sm font-mono"
                  />
                </div>
              )}

              {/* Advanced Config */}
              <div>
                <Label className="text-white/60 text-xs mb-1">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={node.config?.timeout_ms || 30000}
                  onChange={(e) => updateNode(node.id, {
                    config: { ...node.config, timeout_ms: parseInt(e.target.value) }
                  })}
                  className="bg-slate-900/50 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1">Retry Count</Label>
                <Input
                  type="number"
                  value={node.config?.retry_count || 0}
                  onChange={(e) => updateNode(node.id, {
                    config: { ...node.config, retry_count: parseInt(e.target.value) }
                  })}
                  className="bg-slate-900/50 border-white/10 text-white text-sm"
                />
              </div>

              {/* Input/Output Mapping */}
              <div className="md:col-span-2">
                <Label className="text-white/60 text-xs mb-1">Input Mapping (JSON)</Label>
                <Textarea
                  value={JSON.stringify(node.input_mapping || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      updateNode(node.id, { input_mapping: JSON.parse(e.target.value) });
                    } catch {}
                  }}
                  placeholder='{"input": "{{previous.output}}"}'
                  className="bg-slate-900/50 border-white/10 text-white text-xs font-mono h-20"
                />
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1">Output Variable</Label>
                <Input
                  value={node.output_variable || ''}
                  onChange={(e) => updateNode(node.id, { output_variable: e.target.value })}
                  className="bg-slate-900/50 border-white/10 text-white text-sm font-mono"
                />
              </div>
            </div>

            {/* Connection Controls */}
            {idx < chain.nodes.length - 1 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white/60">Connect to:</span>
                <Select
                  onValueChange={(targetId) => addEdge(node.id, targetId)}
                  value=""
                >
                  <SelectTrigger className="w-48 bg-slate-800/50 border-white/10 text-white text-xs">
                    <SelectValue placeholder="Select target node" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    {chain.nodes.filter(n => n.id !== node.id).map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="always">
                  <SelectTrigger className="w-32 bg-slate-800/50 border-white/10 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="if_true">If True</SelectItem>
                    <SelectItem value="if_false">If False</SelectItem>
                    <SelectItem value="on_error">On Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CinematicCard>
        ))}
      </div>

      {/* Debug Controls */}
      <div className="flex gap-3">
        <Button
          onClick={() => onDebug?.(chain)}
          variant="outline"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Play className="w-4 h-4 mr-2" />
          Debug Chain
        </Button>
      </div>
    </div>
  );
}