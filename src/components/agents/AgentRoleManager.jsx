import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useEntityList, useCreateEntity, useUpdateEntity, useDeleteEntity } from "@/hooks/useEntity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot, Plus, Edit3, Trash2, Shield, Zap, Brain, Code,
  Eye, MessageSquare, Database, Globe, Save, X, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const ROLE_PRESETS = [
  {
    name: "Coordinator",
    role: "Project Coordinator",
    color: "#FF7B00",
    personality: { tone: "professional", verbosity: "balanced", expertise_level: "senior" },
    capabilities: [
      { name: "task_delegation", description: "Delegate tasks to other agents" },
      { name: "progress_tracking", description: "Track overall project progress" },
      { name: "conflict_resolution", description: "Resolve conflicts between agents" }
    ],
    permissions: { can_create_tasks: true, can_delegate: true, can_communicate: true }
  },
  {
    name: "Analyst",
    role: "Data Analyst",
    color: "#00B4D8",
    personality: { tone: "analytical", verbosity: "detailed", expertise_level: "expert" },
    capabilities: [
      { name: "data_analysis", description: "Analyze data and generate insights" },
      { name: "pattern_recognition", description: "Identify patterns and anomalies" },
      { name: "reporting", description: "Create detailed reports" }
    ],
    permissions: { can_access_external_apis: true, can_communicate: true }
  },
  {
    name: "Developer",
    role: "Software Developer",
    color: "#10B981",
    personality: { tone: "technical", verbosity: "concise", expertise_level: "senior" },
    capabilities: [
      { name: "code_generation", description: "Generate and review code" },
      { name: "debugging", description: "Debug and fix issues" },
      { name: "architecture_design", description: "Design system architecture" }
    ],
    permissions: { can_modify_data: true, can_communicate: true }
  },
  {
    name: "Reviewer",
    role: "Quality Reviewer",
    color: "#8B5CF6",
    personality: { tone: "professional", verbosity: "detailed", expertise_level: "senior" },
    capabilities: [
      { name: "quality_review", description: "Review work quality" },
      { name: "feedback_generation", description: "Provide constructive feedback" },
      { name: "approval", description: "Approve or reject work" }
    ],
    permissions: { can_communicate: true }
  }
];

export default function AgentRoleManager() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const { data: agents = [], isLoading } = useEntityList('AgentDefinition');

  const createMutation = useCreateEntity('AgentDefinition', {
    onSuccess: () => {
      setShowEditor(false);
      setEditingAgent(null);
    }
  });

  const updateMutation = useUpdateEntity('AgentDefinition', {
    onSuccess: () => {
      setShowEditor(false);
      setEditingAgent(null);
    }
  });

  const deleteMutation = useDeleteEntity('AgentDefinition');

  const saveMutation = editingAgent?.id ? updateMutation : createMutation;

  const applyPreset = (preset) => {
    setEditingAgent({
      ...preset,
      slug: preset.name.toLowerCase().replace(/\s+/g, '-'),
      system_prompt: `You are a ${preset.role}. ${preset.capabilities.map(c => c.description).join('. ')}.`
    });
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-400" />
            Agent Roles & Permissions
          </h2>
          <p className="text-sm text-gray-400">Define agent capabilities and access controls</p>
        </div>
        <Button
          onClick={() => { setEditingAgent(null); setShowEditor(true); }}
          className="bg-gradient-to-r from-orange-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-3">
        {ROLE_PRESETS.map((preset, idx) => (
          <motion.button
            key={preset.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => applyPreset(preset)}
            className="p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all text-left"
            style={{ background: `linear-gradient(135deg, ${preset.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
          >
            <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                 style={{ background: `${preset.color}20` }}>
              <Sparkles className="w-4 h-4" style={{ color: preset.color }} />
            </div>
            <div className="font-medium text-white text-sm">{preset.name}</div>
            <div className="text-xs text-gray-400">{preset.role}</div>
          </motion.button>
        ))}
      </div>

      {/* Agent List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all"
            style={{ background: `linear-gradient(135deg, ${agent.color || '#6B7280'}10 0%, rgba(30, 41, 59, 0.95) 100%)` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ background: `${agent.color || '#6B7280'}20` }}>
                  <Bot className="w-6 h-6" style={{ color: agent.color || '#6B7280' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                </div>
              </div>
              <Badge className={agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {agent.status || 'active'}
              </Badge>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.description}</p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mb-4">
              {agent.capabilities?.slice(0, 3).map((cap, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-300">
                  {cap.name}
                </span>
              ))}
              {(agent.capabilities?.length || 0) > 3 && (
                <span className="text-xs text-gray-500">+{agent.capabilities.length - 3}</span>
              )}
            </div>

            {/* Permissions */}
            <div className="flex gap-2 mb-4">
              {agent.permissions?.can_delegate && (
                <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center" title="Can Delegate">
                  <Zap className="w-3 h-3 text-orange-400" />
                </div>
              )}
              {agent.permissions?.can_access_external_apis && (
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center" title="API Access">
                  <Globe className="w-3 h-3 text-blue-400" />
                </div>
              )}
              {agent.permissions?.can_modify_data && (
                <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center" title="Data Modify">
                  <Database className="w-3 h-3 text-green-400" />
                </div>
              )}
              {agent.permissions?.can_communicate && (
                <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center" title="Communicate">
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                </div>
              )}
            </div>

            {/* Metrics */}
            {agent.metrics && (
              <div className="flex gap-4 text-xs text-gray-500 mb-4 pt-3 border-t border-white/5">
                <span>{agent.metrics.tasks_completed || 0} tasks</span>
                <span>{agent.metrics.success_rate || 0}% success</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white/10 text-gray-400"
                onClick={() => { setEditingAgent(agent); setShowEditor(true); }}
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => deleteMutation.mutate(agent.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <AgentEditor
            agent={editingAgent}
            onClose={() => { setShowEditor(false); setEditingAgent(null); }}
            onSave={(data) => saveMutation.mutate(data)}
            isSaving={saveMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentEditor({ agent, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(agent || {
    name: "",
    slug: "",
    role: "",
    description: "",
    color: "#FF7B00",
    personality: { tone: "professional", verbosity: "balanced", expertise_level: "senior" },
    capabilities: [],
    permissions: {
      can_create_tasks: false,
      can_delegate: false,
      can_access_external_apis: false,
      can_modify_data: false,
      can_communicate: true
    },
    system_prompt: "",
    memory_config: { short_term_limit: 10, long_term_enabled: false, context_window: 4000 },
    status: "active"
  });

  const [newCapability, setNewCapability] = useState({ name: "", description: "" });

  const updateField = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addCapability = () => {
    if (newCapability.name) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...(prev.capabilities || []), { ...newCapability }]
      }));
      setNewCapability({ name: "", description: "" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {agent?.id ? "Edit Agent" : "Create Agent"}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  updateField('name', e.target.value);
                  updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Agent Name"
              />
            </div>
            <div>
              <Label className="text-gray-400">Role</Label>
              <Input
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g., Data Analyst"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="active" className="text-white">Active</SelectItem>
                  <SelectItem value="inactive" className="text-white">Inactive</SelectItem>
                  <SelectItem value="maintenance" className="text-white">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="What does this agent do?"
            />
          </div>

          {/* Personality */}
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Personality
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-400">Tone</Label>
                <Select value={formData.personality?.tone} onValueChange={(v) => updateField('personality.tone', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {['professional', 'friendly', 'technical', 'creative', 'analytical'].map(t => (
                      <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Verbosity</Label>
                <Select value={formData.personality?.verbosity} onValueChange={(v) => updateField('personality.verbosity', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {['concise', 'balanced', 'detailed'].map(v => (
                      <SelectItem key={v} value={v} className="text-white capitalize">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Expertise</Label>
                <Select value={formData.personality?.expertise_level} onValueChange={(v) => updateField('personality.expertise_level', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {['junior', 'mid', 'senior', 'expert'].map(e => (
                      <SelectItem key={e} value={e} className="text-white capitalize">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              Permissions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'can_create_tasks', label: 'Create Tasks', icon: Plus },
                { key: 'can_delegate', label: 'Delegate Work', icon: Zap },
                { key: 'can_access_external_apis', label: 'External APIs', icon: Globe },
                { key: 'can_modify_data', label: 'Modify Data', icon: Database },
                { key: 'can_communicate', label: 'Communicate', icon: MessageSquare }
              ].map(perm => (
                <div key={perm.key} className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <perm.icon className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-300">{perm.label}</span>
                  </div>
                  <Switch
                    checked={formData.permissions?.[perm.key] || false}
                    onCheckedChange={(v) => updateField(`permissions.${perm.key}`, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Capabilities
            </h4>
            <div className="space-y-2 mb-3">
              {formData.capabilities?.map((cap, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5">
                  <code className="text-orange-400 text-sm flex-1">{cap.name}</code>
                  <span className="text-xs text-gray-400 flex-1">{cap.description}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      capabilities: prev.capabilities.filter((_, idx) => idx !== i)
                    }))}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Capability name"
                value={newCapability.name}
                onChange={(e) => setNewCapability(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Input
                placeholder="Description"
                value={newCapability.description}
                onChange={(e) => setNewCapability(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Button onClick={addCapability} size="icon" className="bg-orange-500">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <Label className="text-gray-400">System Prompt</Label>
            <Textarea
              value={formData.system_prompt}
              onChange={(e) => updateField('system_prompt', e.target.value)}
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[100px]"
              placeholder="You are a helpful assistant that..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} className="border-white/10 text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={() => onSave(editingAgent?.id ? { id: editingAgent.id, data: formData } : formData)}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Agent</>}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}