import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, Plus, Trash2, Play, Save, ArrowRight, Settings } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { toast } from 'sonner';

export function ChainBuilder({ onSave, existingChain }) {
  const [chain, setChain] = useState(existingChain || {
    name: '',
    description: '',
    nodes: [{
      id: 'node_1',
      name: 'Initial Prompt',
      template_id: '',
      config: {},
      position: { x: 100, y: 100 }
    }],
    edges: []
  });

  const addNode = () => {
    const newNode = {
      id: `node_${chain.nodes.length + 1}`,
      name: `Step ${chain.nodes.length + 1}`,
      template_id: '',
      config: {},
      position: { x: 100, y: 100 + (chain.nodes.length * 150) }
    };
    setChain({ ...chain, nodes: [...chain.nodes, newNode] });
  };

  const removeNode = (nodeId) => {
    setChain({
      ...chain,
      nodes: chain.nodes.filter(n => n.id !== nodeId),
      edges: chain.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    });
  };

  const connectNodes = (sourceId, targetId, condition = null) => {
    const newEdge = {
      id: `edge_${chain.edges.length + 1}`,
      source: sourceId,
      target: targetId,
      condition
    };
    setChain({ ...chain, edges: [...chain.edges, newEdge] });
  };

  const handleSave = () => {
    if (!chain.name) {
      toast.error('Please provide a chain name');
      return;
    }
    onSave(chain);
  };

  return (
    <div className="space-y-6">
      {/* Chain Metadata */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Chain Configuration</h3>
            <p className="text-white/60 text-sm">Build multi-step prompt workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2">Chain Name</Label>
            <Input
              value={chain.name}
              onChange={(e) => setChain({ ...chain, name: e.target.value })}
              placeholder="e.g., User Research Pipeline"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2">Description</Label>
            <Input
              value={chain.description}
              onChange={(e) => setChain({ ...chain, description: e.target.value })}
              placeholder="What does this chain do?"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
        </div>
      </CinematicCard>

      {/* Chain Nodes */}
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-white">Workflow Steps</h4>
          <Button
            onClick={addNode}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          {chain.nodes.map((node, idx) => (
            <div key={node.id} className="relative">
              <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Step {idx + 1}
                    </Badge>
                    <Input
                      value={node.name}
                      onChange={(e) => {
                        const updated = [...chain.nodes];
                        updated[idx].name = e.target.value;
                        setChain({ ...chain, nodes: updated });
                      }}
                      className="bg-slate-900/50 border-white/10 text-white w-64"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60 text-xs mb-1">Prompt Template</Label>
                    <Select
                      value={node.template_id}
                      onValueChange={(value) => {
                        const updated = [...chain.nodes];
                        updated[idx].template_id = value;
                        setChain({ ...chain, nodes: updated });
                      }}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="template_1">Analysis Template</SelectItem>
                        <SelectItem value="template_2">Synthesis Template</SelectItem>
                        <SelectItem value="template_3">Validation Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/60 text-xs mb-1">Variable Mapping</Label>
                    <Textarea
                      placeholder='{"input": "{{previous.output}}"}'
                      className="bg-slate-900/50 border-white/10 text-white text-xs font-mono h-20"
                    />
                  </div>
                </div>

                {idx < chain.nodes.length - 1 && (
                  <div className="mt-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Then execute:</span>
                    <Badge variant="outline" className="border-white/20">
                      {chain.nodes[idx + 1]?.name || 'Next step'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CinematicCard>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-emerald-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Chain
        </Button>
        <Button
          variant="outline"
          className="border-white/10"
        >
          <Play className="w-4 h-4 mr-2" />
          Test Chain
        </Button>
      </div>
    </div>
  );
}