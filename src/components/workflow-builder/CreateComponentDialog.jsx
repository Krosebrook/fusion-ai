/**
 * Create Component Dialog - Convert selected nodes to reusable component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function CreateComponentDialog({ selectedNodes, selectedEdges, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [icon, setIcon] = useState('📦');
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'api', label: 'API Integration' },
    { value: 'data_processing', label: 'Data Processing' },
    { value: 'notification', label: 'Notification' },
    { value: 'ai', label: 'AI/ML' },
    { value: 'integration', label: 'Integration' },
    { value: 'utility', label: 'Utility' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleAddInput = () => {
    setInputs([...inputs, { name: '', type: 'string', required: false, description: '' }]);
  };

  const handleAddOutput = () => {
    setOutputs([...outputs, { name: '', type: 'string', description: '' }]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Component name is required');
      return;
    }

    setSaving(true);
    try {
      const component = await base44.entities.WorkflowComponent.create({
        name,
        description,
        category,
        icon,
        nodes: selectedNodes,
        edges: selectedEdges,
        inputs,
        outputs,
        is_public: isPublic,
        version: '1.0.0',
      });

      toast.success('Component created successfully');
      onCreated(component);
      onClose();
    } catch (error) {
      toast.error('Failed to create component');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto"
      >
        <CinematicCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Create Component</h2>
                <p className="text-white/60 text-sm">
                  {selectedNodes.length} nodes selected
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-6">
            <CinematicInput
              label="Component Name"
              placeholder="My Reusable Component"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <Label className="text-white mb-2 block">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this component do?"
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CinematicInput
                label="Icon (Emoji)"
                placeholder="📦"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white">Input Parameters</Label>
                <CinematicButton variant="glass" size="sm" icon={Plus} onClick={handleAddInput}>
                  Add Input
                </CinematicButton>
              </div>
              <div className="space-y-2">
                {inputs.map((input, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-white/5">
                    <input
                      placeholder="Name"
                      value={input.name}
                      onChange={(e) => {
                        const updated = [...inputs];
                        updated[idx].name = e.target.value;
                        setInputs(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    />
                    <button
                      onClick={() => setInputs(inputs.filter((_, i) => i !== idx))}
                      className="p-2 rounded hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white">Output Parameters</Label>
                <CinematicButton variant="glass" size="sm" icon={Plus} onClick={handleAddOutput}>
                  Add Output
                </CinematicButton>
              </div>
              <div className="space-y-2">
                {outputs.map((output, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-white/5">
                    <input
                      placeholder="Name"
                      value={output.name}
                      onChange={(e) => {
                        const updated = [...outputs];
                        updated[idx].name = e.target.value;
                        setOutputs(updated);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    />
                    <button
                      onClick={() => setOutputs(outputs.filter((_, i) => i !== idx))}
                      className="p-2 rounded hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <CinematicButton variant="ghost" onClick={onClose}>
              Cancel
            </CinematicButton>
            <CinematicButton
              variant="primary"
              icon={Package}
              onClick={handleSave}
              loading={saving}
              glow
            >
              Create Component
            </CinematicButton>
          </div>
        </CinematicCard>
      </motion.div>
    </div>
  );
}

export default CreateComponentDialog;