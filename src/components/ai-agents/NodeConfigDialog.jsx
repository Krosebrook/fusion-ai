import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export function NodeConfigDialog({ node, onSave, onClose }) {
  const [config, setConfig] = useState(node.config || {});

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <span className="text-2xl">{node.icon}</span>
            Configure {node.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {node.type === 'logic' && node.agentId === 'condition' && (
            <>
              <div>
                <Label className="text-white mb-2 block">Condition Expression</Label>
                <Input
                  value={config.condition || ''}
                  onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                  placeholder="output.score > 80"
                  className="bg-slate-950/50 border-white/10 text-white font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Access previous agent output with <code className="text-cyan-400">output.property</code>
                </p>
              </div>
              <div>
                <Label className="text-white mb-2 block">True Branch</Label>
                <Input
                  value={config.trueBranch || ''}
                  onChange={(e) => setConfig({ ...config, trueBranch: e.target.value })}
                  placeholder="Next agent if true"
                  className="bg-slate-950/50 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">False Branch</Label>
                <Input
                  value={config.falseBranch || ''}
                  onChange={(e) => setConfig({ ...config, falseBranch: e.target.value })}
                  placeholder="Next agent if false"
                  className="bg-slate-950/50 border-white/10 text-white"
                />
              </div>
            </>
          )}

          {node.type === 'logic' && node.agentId === 'parallel' && (
            <div>
              <Label className="text-white mb-2 block">Parallel Agents (comma-separated)</Label>
              <Input
                value={config.parallelAgents || ''}
                onChange={(e) => setConfig({ ...config, parallelAgents: e.target.value })}
                placeholder="tester, reviewer, documenter"
                className="bg-slate-950/50 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                These agents will execute simultaneously
              </p>
            </div>
          )}

          {node.type === 'agent' && (
            <>
              <div>
                <Label className="text-white mb-2 block">Context Mapping</Label>
                <Textarea
                  value={config.contextMapping || ''}
                  onChange={(e) => setConfig({ ...config, contextMapping: e.target.value })}
                  placeholder="previousOutput = scaffolder_output.files"
                  rows={3}
                  className="bg-slate-950/50 border-white/10 text-white font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Output Variable Name</Label>
                <Input
                  value={config.outputVar || `${node.agentId}_output`}
                  onChange={(e) => setConfig({ ...config, outputVar: e.target.value })}
                  placeholder={`${node.agentId}_output`}
                  className="bg-slate-950/50 border-white/10 text-white font-mono"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 border-white/10">
              Cancel
            </Button>
            <Button onClick={() => onSave(config)} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}