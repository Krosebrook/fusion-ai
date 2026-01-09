/**
 * Prompt Editor with Variable Management
 * Rich text editor for crafting prompts with dynamic variables
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CinematicCard } from '../atoms/CinematicCard';
import { 
  Plus, X, Sparkles, Save, Code, 
  Settings, Variable, Hash, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function PromptEditor({ template, onSave }) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [promptText, setPromptText] = useState(template?.template || '');
  const [variables, setVariables] = useState(template?.variables || []);
  const [category, setCategory] = useState(template?.category || 'custom');
  const [showVariableForm, setShowVariableForm] = useState(false);
  const [newVariable, setNewVariable] = useState({ name: '', type: 'string', description: '', default: '' });

  const addVariable = useCallback(() => {
    if (!newVariable.name.trim()) {
      toast.error('Variable name cannot be empty');
      return;
    }
    
    if (variables.some(v => v.name === newVariable.name)) {
      toast.error('Variable name already exists');
      return;
    }

    setVariables(prev => [...prev, { ...newVariable, required: true }]);
    setNewVariable({ name: '', type: 'string', description: '', default: '' });
    setShowVariableForm(false);
    setPromptText(prev => prev + `{{${newVariable.name}}}`);
  }, [newVariable, variables]);

  const removeVariable = useCallback((varName) => {
    setVariables(prev => prev.filter(v => v.name !== varName));
  }, []);

  const insertVariable = useCallback((varName) => {
    setPromptText(prev => prev + `{{${varName}}}`);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Prompt name is required');
      return;
    }
    
    if (!promptText.trim()) {
      toast.error('Prompt template cannot be empty');
      return;
    }

    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        template: promptText,
        variables: variables.filter(v => v.name),
        category,
        tags: [],
        is_public: false
      };

      const saved = template?.id
        ? await base44.entities.PromptTemplate.update(template.id, data)
        : await base44.entities.PromptTemplate.create(data);

      toast.success(`Prompt ${template ? 'updated' : 'created'} successfully`);
      onSave?.(saved);
    } catch (error) {
      toast.error(error?.message || 'Failed to save prompt');
    }
  }, [name, promptText, variables, category, template, onSave]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-400" />
              Prompt Template
            </h2>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Template Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Code Review Assistant"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this prompt do?"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="agent">Agent</option>
                <option value="api">API</option>
                <option value="workflow">Workflow</option>
                <option value="analysis">Analysis</option>
                <option value="generation">Generation</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 flex items-center justify-between">
                <span>Prompt Text</span>
                <span className="text-xs text-white/40">
                  Use {`{{variable_name}}`} for dynamic values
                </span>
              </label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Write your prompt here... Use {{variable_name}} for dynamic content."
                className="bg-white/5 border-white/10 text-white min-h-[400px] font-mono text-sm"
              />
            </div>

            {/* Variable Quick Insert */}
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-white/60 text-sm">Quick Insert:</span>
                {variables.map((v) => (
                  <Button
                    key={v.name}
                    onClick={() => insertVariable(v.name)}
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Variable className="w-3 h-3 mr-1" />
                    {v.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CinematicCard>
      </div>

      {/* Variable Manager Sidebar */}
      <div className="space-y-6">
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Variable className="w-5 h-5 text-cyan-400" />
              Variables
            </h3>
            <Button
              onClick={() => setShowVariableForm(!showVariableForm)}
              size="sm"
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* New Variable Form */}
          <AnimatePresence>
            {showVariableForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="mb-4 p-4 rounded-lg bg-white/5 border border-cyan-500/30 space-y-3"
            >
              <Input
                placeholder="Variable Name"
                value={newVariable.name}
                onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <select
                value={newVariable.type}
                onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
              <Input
                placeholder="Description"
                value={newVariable.description}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <Input
                placeholder="Default Value"
                value={newVariable.default}
                onChange={(e) => setNewVariable({ ...newVariable, default: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
              <Button onClick={addVariable} size="sm" className="w-full bg-cyan-600">
                Add Variable
              </Button>
            </motion.div>
            )}
          </AnimatePresence>

          {/* Variables List */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {variables.map((variable, idx) => (
              <motion.div
                key={variable.name}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: idx * 0.02 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-mono text-sm">{variable.name}</span>
                  </div>
                  <button
                    onClick={() => removeVariable(variable.name)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Badge className="text-xs bg-purple-500/20 text-purple-300 mb-1">
                  {variable.type}
                </Badge>
                {variable.description && (
                  <p className="text-white/60 text-xs mt-1">{variable.description}</p>
                )}
                {variable.default && (
                  <p className="text-white/40 text-xs mt-1">Default: {variable.default}</p>
                )}
              </motion.div>
              ))}
            </AnimatePresence>

            {variables.length === 0 && (
              <div className="text-center py-8 text-white/40">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No variables yet</p>
                <p className="text-xs mt-1">Add variables to make your prompt dynamic</p>
              </div>
            )}
          </div>
        </CinematicCard>

        {/* LLM Settings */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-400" />
            LLM Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Temperature</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Max Tokens</label>
              <Input
                type="number"
                defaultValue="1000"
                className="bg-white/5 border-white/10 text-white text-sm"
              />
            </div>
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}