import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateEntity, useUpdateEntity } from '@/components/hooks/useEntity';
import { toast } from 'sonner';

const PERSONALITY_PRESETS = {
  analytical: { tone: 'technical', verbosity: 'concise', creativity: 30 },
  creative: { tone: 'friendly', verbosity: 'balanced', creativity: 90 },
  balanced: { tone: 'professional', verbosity: 'balanced', creativity: 60 }
};

export function AgentConfigurator({ agent, onClose }) {
  const [config, setConfig] = useState(agent || {
    name: '',
    role: '',
    description: '',
    personality: { tone: 'professional', verbosity: 'balanced', creativity: 60 },
    capabilities: [],
    permissions: { can_create_tasks: true, can_delegate: false, can_access_external_apis: true },
    system_prompt: ''
  });

  const createMutation = useCreateEntity('AgentDefinition');
  const updateMutation = useUpdateEntity('AgentDefinition');

  const handleSave = () => {
    const mutation = agent ? updateMutation : createMutation;
    const data = agent ? { id: agent.id, data: config } : config;

    mutation.mutate(data, {
      successMessage: agent ? 'Agent updated!' : 'Agent created!',
      onSuccess: onClose
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{agent ? 'Edit' : 'Create'} AI Agent</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Agent Name</Label>
              <Input value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} placeholder="Code Review Expert" className="bg-slate-950/50 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white mb-2 block">Role</Label>
              <Input value={config.role} onChange={(e) => setConfig({...config, role: e.target.value})} placeholder="Senior Code Reviewer" className="bg-slate-950/50 border-white/10 text-white" />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Description</Label>
            <Textarea value={config.description} onChange={(e) => setConfig({...config, description: e.target.value})} placeholder="What this agent does..." className="bg-slate-950/50 border-white/10 text-white" />
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4">Behavioral Parameters</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-white">Creativity Level</Label>
                  <span className="text-sm text-gray-400">{config.personality.creativity}%</span>
                </div>
                <Slider value={[config.personality.creativity]} onValueChange={([val]) => setConfig({...config, personality: {...config.personality, creativity: val}})} max={100} step={10} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Higher = more creative/exploratory responses</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Tone</Label>
                  <select value={config.personality.tone} onChange={(e) => setConfig({...config, personality: {...config.personality, tone: e.target.value}})} className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded text-white">
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="technical">Technical</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white mb-2 block">Verbosity</Label>
                  <select value={config.personality.verbosity} onChange={(e) => setConfig({...config, personality: {...config.personality, verbosity: e.target.value}})} className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded text-white">
                    <option value="concise">Concise</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4">Permissions</h4>
            <div className="space-y-3">
              {[
                { key: 'can_create_tasks', label: 'Create Tasks', desc: 'Agent can create subtasks' },
                { key: 'can_delegate', label: 'Delegate Work', desc: 'Agent can delegate to other agents' },
                { key: 'can_access_external_apis', label: 'Access External APIs', desc: 'Agent can call external services' }
              ].map(perm => (
                <div key={perm.key} className="flex items-start gap-3 p-3 bg-white/5 rounded cursor-pointer" onClick={() => setConfig({...config, permissions: {...config.permissions, [perm.key]: !config.permissions[perm.key]}})}>
                  <Checkbox checked={config.permissions[perm.key]} className="mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-white">{perm.label}</div>
                    <div className="text-xs text-gray-400">{perm.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">System Prompt</Label>
            <Textarea value={config.system_prompt} onChange={(e) => setConfig({...config, system_prompt: e.target.value})} placeholder="You are an expert code reviewer..." rows={6} className="bg-slate-950/50 border-white/10 text-white font-mono text-sm" />
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 border-white/10">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">Save Agent</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}