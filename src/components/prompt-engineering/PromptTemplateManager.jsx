import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useEntityList, useDeleteEntity } from "@/components/hooks/useEntity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileText, Plus, Search, Copy, Trash2, Edit3, Sparkles, 
  Code, Zap, GitBranch, Shield, Brain, ChevronRight, Star,
  Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_CONFIG = {
  agent: { icon: Brain, color: "#8B5CF6", label: "Agent" },
  api: { icon: Code, color: "#00B4D8", label: "API" },
  workflow: { icon: GitBranch, color: "#10B981", label: "Workflow" },
  analysis: { icon: Zap, color: "#F59E0B", label: "Analysis" },
  generation: { icon: Sparkles, color: "#E91E63", label: "Generation" },
  custom: { icon: FileText, color: "#6B7280", label: "Custom" }
};

export default function PromptTemplateManager({ onSelectTemplate, selectedAgent }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates = [], isLoading } = useEntityList('PromptTemplate', {}, '-created_date', 100);
  const deleteMutation = useDeleteEntity('PromptTemplate', { successMessage: 'Template deleted' });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesAgent = !selectedAgent || !t.agent_id || t.agent_id === selectedAgent;
    return matchesSearch && matchesCategory && matchesAgent;
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template) => {
      const { id, created_date, updated_date, created_by, ...rest } = template;
      return base44.entities.PromptTemplate.create({
        ...rest,
        name: `${template.name} (Copy)`,
        usage_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptTemplates']);
      toast.success("Template duplicated");
    }
  });

  const handleDuplicate = (template) => duplicateMutation.mutate(template);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-400" />
          Prompt Templates
        </h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem value="all" className="text-white">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key} className="text-white">
                <div className="flex items-center gap-2">
                  <config.icon className="w-4 h-4" style={{ color: config.color }} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredTemplates.map((template, idx) => {
          const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.custom;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-lg border border-white/10 p-4 hover:border-white/20 transition-all cursor-pointer group"
              style={{ background: `linear-gradient(135deg, ${config.color}08 0%, rgba(30, 41, 59, 0.9) 100%)` }}
              onClick={() => onSelectTemplate?.(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: `${config.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{template.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </div>

              {/* Variables preview */}
              {template.variables?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.variables.slice(0, 3).map((v, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                      {`{{${v.name}}}`}
                    </span>
                  ))}
                  {template.variables.length > 3 && (
                    <span className="text-xs text-gray-500">+{template.variables.length - 3}</span>
                  )}
                </div>
              )}

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {template.usage_count || 0}
                  </span>
                  {template.success_rate && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {template.success_rate}%
                    </span>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                          onClick={() => setEditingTemplate(template)}>
                    <Edit3 className="w-3 h-3 text-gray-400" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                          onClick={() => handleDuplicate(template)}>
                    <Copy className="w-3 h-3 text-gray-400" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                          onClick={() => deleteMutation.mutate(template.id)}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingTemplate) && (
          <PromptTemplateEditor
            template={editingTemplate}
            onClose={() => {
              setShowCreateModal(false);
              setEditingTemplate(null);
            }}
            selectedAgent={selectedAgent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptTemplateEditor({ template, onClose, selectedAgent }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(template || {
    name: "",
    description: "",
    category: "custom",
    agent_id: selectedAgent || "",
    template: "",
    variables: [],
    context_injection: {
      include_user_context: false,
      include_pipeline_context: false,
      include_environment_context: false,
      max_context_tokens: 2000
    },
    chain_of_thought: {
      enabled: false,
      steps: [],
      require_reasoning: true
    },
    llm_settings: {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1
    },
    tags: []
  });

  const [newVariable, setNewVariable] = useState({ name: "", type: "string", source: "user_input" });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (template?.id) {
        return base44.entities.PromptTemplate.update(template.id, data);
      }
      return base44.entities.PromptTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptTemplates']);
      toast.success(template ? "Template updated" : "Template created");
      onClose();
    }
  });

  const extractVariables = (text) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    const varNames = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
    const existing = formData.variables.map(v => v.name);
    const newVars = varNames.filter(n => !existing.includes(n)).map(name => ({
      name,
      type: "string",
      source: "user_input",
      required: true
    }));
    if (newVars.length > 0) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, ...newVars]
      }));
    }
  };

  const addVariable = () => {
    if (newVariable.name) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable, required: true }]
      }));
      setNewVariable({ name: "", type: "string", source: "user_input" });
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6">
          {template ? "Edit Template" : "Create Prompt Template"}
        </h2>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="My Prompt Template"
              />
            </div>
            <div>
              <Label className="text-gray-400">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              placeholder="What does this template do?"
            />
          </div>

          {/* Prompt Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-gray-400">Prompt Template</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => extractVariables(formData.template)}
                className="text-xs text-orange-400"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-detect Variables
              </Button>
            </div>
            <Textarea
              value={formData.template}
              onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[150px]"
              placeholder="You are a {{role}} assistant. Analyze the following {{data_type}} and provide insights..."
            />
            <p className="text-xs text-gray-500 mt-1">Use {"{{variable_name}}"} for dynamic placeholders</p>
          </div>

          {/* Variables */}
          <div>
            <Label className="text-gray-400 mb-2 block">Variables</Label>
            <div className="space-y-2 mb-3">
              {formData.variables.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5">
                  <code className="text-orange-400 text-sm">{`{{${v.name}}}`}</code>
                  <Badge variant="outline" className="text-xs">{v.type}</Badge>
                  <Badge variant="outline" className="text-xs">{v.source}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 ml-auto"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      variables: prev.variables.filter((_, idx) => idx !== i)
                    }))}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Variable name"
                value={newVariable.name}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Select value={newVariable.type} onValueChange={(v) => setNewVariable(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="w-28 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="string" className="text-white">String</SelectItem>
                  <SelectItem value="number" className="text-white">Number</SelectItem>
                  <SelectItem value="array" className="text-white">Array</SelectItem>
                  <SelectItem value="object" className="text-white">Object</SelectItem>
                  <SelectItem value="context" className="text-white">Context</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newVariable.source} onValueChange={(v) => setNewVariable(prev => ({ ...prev, source: v }))}>
                <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="user_input" className="text-white">User Input</SelectItem>
                  <SelectItem value="user_data" className="text-white">User Data</SelectItem>
                  <SelectItem value="pipeline_data" className="text-white">Pipeline</SelectItem>
                  <SelectItem value="environment" className="text-white">Environment</SelectItem>
                  <SelectItem value="api_response" className="text-white">API Response</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addVariable} size="icon" className="bg-orange-500">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Context Injection */}
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <h4 className="font-medium text-white mb-3">Context Injection</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.context_injection.include_user_context}
                  onCheckedChange={(v) => setFormData(prev => ({
                    ...prev,
                    context_injection: { ...prev.context_injection, include_user_context: v }
                  }))}
                />
                <Label className="text-sm text-gray-400">User Context</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.context_injection.include_pipeline_context}
                  onCheckedChange={(v) => setFormData(prev => ({
                    ...prev,
                    context_injection: { ...prev.context_injection, include_pipeline_context: v }
                  }))}
                />
                <Label className="text-sm text-gray-400">Pipeline Context</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.context_injection.include_environment_context}
                  onCheckedChange={(v) => setFormData(prev => ({
                    ...prev,
                    context_injection: { ...prev.context_injection, include_environment_context: v }
                  }))}
                />
                <Label className="text-sm text-gray-400">Environment</Label>
              </div>
            </div>
          </div>

          {/* Chain of Thought */}
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Chain-of-Thought Reasoning</h4>
              <Switch
                checked={formData.chain_of_thought.enabled}
                onCheckedChange={(v) => setFormData(prev => ({
                  ...prev,
                  chain_of_thought: { ...prev.chain_of_thought, enabled: v }
                }))}
              />
            </div>
            {formData.chain_of_thought.enabled && (
              <Textarea
                placeholder="Step 1: Analyze input...\nStep 2: Identify patterns...\nStep 3: Generate insights..."
                value={formData.chain_of_thought.steps?.join("\n") || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  chain_of_thought: { ...prev.chain_of_thought, steps: e.target.value.split("\n").filter(Boolean) }
                }))}
                className="bg-white/5 border-white/10 text-white text-sm"
              />
            )}
          </div>

          {/* LLM Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-400">Temperature</Label>
              <Input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.llm_settings.temperature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  llm_settings: { ...prev.llm_settings, temperature: parseFloat(e.target.value) }
                }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Max Tokens</Label>
              <Input
                type="number"
                min="100"
                max="8000"
                step="100"
                value={formData.llm_settings.max_tokens}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  llm_settings: { ...prev.llm_settings, max_tokens: parseInt(e.target.value) }
                }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Top P</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.llm_settings.top_p}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  llm_settings: { ...prev.llm_settings, top_p: parseFloat(e.target.value) }
                }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} className="border-white/10 text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {saveMutation.isPending ? "Saving..." : template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}