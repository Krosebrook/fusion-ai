/**
 * Agent Configuration Panel
 * Define and configure AI agent roles, capabilities, and permissions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bot,
  Save,
  X,
  Plus,
  Trash2,
  Settings,
  Shield,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { agentOrchestrationService, type AgentRole, type AgentCapability, type AgentPermissions } from '../services/AgentOrchestrationService';

interface AgentConfigurationPanelProps {
  agent?: AgentRole;
  onSave: (agent: AgentRole) => void;
  onCancel: () => void;
}

export function AgentConfigurationPanel({ agent, onSave, onCancel }: AgentConfigurationPanelProps) {
  const [formData, setFormData] = useState<Partial<AgentRole>>(
    agent || {
      name: '',
      description: '',
      capabilities: [],
      permissions: {
        canCreateTasks: false,
        canDelegate: false,
        canAccessExternalAPIs: false,
        canModifyData: false,
        canCommunicate: true,
        allowedEntities: [],
        allowedIntegrations: [],
      },
      systemPrompt: '',
      personality: {
        tone: 'professional',
        verbosity: 'balanced',
        expertiseLevel: 'senior',
      },
    }
  );

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'capabilities' | 'permissions' | 'personality'>('basic');

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData.name?.trim()) {
        toast.error('Agent name is required');
        return;
      }

      let result: AgentRole;
      if (agent?.id) {
        result = await agentOrchestrationService.updateAgent(agent.id, formData);
      } else {
        result = await agentOrchestrationService.registerAgent(formData);
      }

      toast.success(`Agent ${agent ? 'updated' : 'created'} successfully`);
      onSave(result);
    } catch (error) {
      toast.error('Failed to save agent');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addCapability = () => {
    const newCapability: AgentCapability = {
      name: '',
      description: '',
    };

    setFormData({
      ...formData,
      capabilities: [...(formData.capabilities || []), newCapability],
    });
  };

  const updateCapability = (index: number, updates: Partial<AgentCapability>) => {
    const capabilities = [...(formData.capabilities || [])];
    capabilities[index] = { ...capabilities[index], ...updates };
    setFormData({ ...formData, capabilities });
  };

  const removeCapability = (index: number) => {
    const capabilities = [...(formData.capabilities || [])];
    capabilities.splice(index, 1);
    setFormData({ ...formData, capabilities });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Bot },
    { id: 'capabilities', label: 'Capabilities', icon: Zap },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'personality', label: 'Personality', icon: MessageSquare },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <CinematicCard>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {agent ? 'Edit Agent' : 'Create New Agent'}
                </h2>
                <p className="text-slate-400 text-sm">
                  Define agent role, capabilities, and behavior
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-orange-500'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <CinematicInput
                    label="Agent Name"
                    placeholder="e.g., Code Review Assistant"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Describe what this agent does..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      System Prompt
                    </Label>
                    <Textarea
                      placeholder="Define the agent's instructions and behavior..."
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="bg-white/5 border-white/10 text-white min-h-[150px] font-mono text-sm"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'capabilities' && (
                <motion.div
                  key="capabilities"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-sm">
                      Define what this agent can do
                    </p>
                    <CinematicButton
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={addCapability}
                    >
                      Add Capability
                    </CinematicButton>
                  </div>

                  {formData.capabilities?.map((capability, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <input
                          type="text"
                          placeholder="Capability name"
                          value={capability.name}
                          onChange={(e) =>
                            updateCapability(index, { name: e.target.value })
                          }
                          className="flex-1 bg-transparent border-none text-white font-medium focus:outline-none"
                        />
                        <button
                          onClick={() => removeCapability(index)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Description"
                        value={capability.description}
                        onChange={(e) =>
                          updateCapability(index, { description: e.target.value })
                        }
                        className="w-full bg-transparent border-none text-slate-400 text-sm focus:outline-none"
                      />
                    </div>
                  ))}

                  {(!formData.capabilities || formData.capabilities.length === 0) && (
                    <div className="text-center py-12 text-slate-400">
                      <Zap className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No capabilities defined yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'permissions' && (
                <motion.div
                  key="permissions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    {[
                      { key: 'canCreateTasks', label: 'Can Create Tasks', desc: 'Allow agent to create new tasks' },
                      { key: 'canDelegate', label: 'Can Delegate', desc: 'Allow agent to delegate work to other agents' },
                      { key: 'canAccessExternalAPIs', label: 'Access External APIs', desc: 'Allow agent to call external services' },
                      { key: 'canModifyData', label: 'Modify Data', desc: 'Allow agent to update database records' },
                      { key: 'canCommunicate', label: 'Can Communicate', desc: 'Allow agent to send messages' },
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{label}</p>
                          <p className="text-slate-400 text-sm">{desc}</p>
                        </div>
                        <Switch
                          checked={formData.permissions?.[key as keyof AgentPermissions] as boolean}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions!,
                                [key]: checked,
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'personality' && (
                <motion.div
                  key="personality"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Communication Tone
                    </Label>
                    <Select
                      value={formData.personality?.tone}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          personality: { ...formData.personality!, tone: value },
                        })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Verbosity Level
                    </Label>
                    <Select
                      value={formData.personality?.verbosity}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          personality: { ...formData.personality!, verbosity: value },
                        })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-300 mb-2 block">
                      Expertise Level
                    </Label>
                    <Select
                      value={formData.personality?.expertiseLevel}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          personality: { ...formData.personality!, expertiseLevel: value },
                        })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10">
              <CinematicButton variant="ghost" onClick={onCancel}>
                Cancel
              </CinematicButton>
              <CinematicButton
                variant="primary"
                icon={Save}
                onClick={handleSave}
                loading={saving}
                glow
              >
                {agent ? 'Update Agent' : 'Create Agent'}
              </CinematicButton>
            </div>
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

export default AgentConfigurationPanel;