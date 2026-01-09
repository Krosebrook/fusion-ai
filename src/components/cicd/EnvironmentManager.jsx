import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Server, Lock, Trash2, Shield, Globe, Edit2, Check, X } from "lucide-react";

const colorOptions = {
  development: { bg: "#00B4D8", light: "rgba(0, 180, 216, 0.1)" },
  staging: { bg: "#F59E0B", light: "rgba(245, 158, 11, 0.1)" },
  production: { bg: "#10B981", light: "rgba(16, 185, 129, 0.1)" },
  custom: { bg: "#8B5CF6", light: "rgba(139, 92, 246, 0.1)" }
};

export default function EnvironmentManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingEnv, setEditingEnv] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const queryClient = useQueryClient();

  const { data: environments = [], isLoading } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.Environment.list('-created_date')
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "development",
    deployment_url: "",
    variables: [],
    secrets: [],
    protection_enabled: false,
    auto_deploy: false,
    branch_restrictions: [],
    active: true
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Environment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['environments']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Environment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['environments']);
      setEditingEnv(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Environment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['environments'])
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "development",
      deployment_url: "",
      variables: [],
      secrets: [],
      protection_enabled: false,
      auto_deploy: false,
      branch_restrictions: [],
      active: true
    });
    setShowForm(false);
    setEditingEnv(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      color: colorOptions[formData.type].bg
    };
    
    if (editingEnv) {
      updateMutation.mutate({ id: editingEnv.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (env) => {
    setEditingEnv(env);
    setFormData(env);
    setShowForm(true);
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, { key: "", value: "", encrypted: false }]
    });
  };

  const updateVariable = (index, field, value) => {
    const updated = [...formData.variables];
    updated[index][field] = value;
    setFormData({ ...formData, variables: updated });
  };

  const removeVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Environment Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">Configure deployment environments and their settings</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-orange-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          New Environment
        </Button>
      </div>

      {/* Environment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Environment Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, '-')
                      });
                    }}
                    placeholder="Production"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Type</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white">Deployment URL</Label>
                <Input
                  value={formData.deployment_url}
                  onChange={(e) => setFormData({ ...formData, deployment_url: e.target.value })}
                  placeholder="https://app.example.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Environment Variables</Label>
                  <Button size="sm" onClick={addVariable} className="bg-blue-500/20 text-blue-400">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Variable
                  </Button>
                </div>
                {formData.variables.map((variable, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="KEY"
                      value={variable.key}
                      onChange={(e) => updateVariable(idx, 'key', e.target.value)}
                      className="bg-white/5 border-white/10 text-white font-mono"
                    />
                    <Input
                      placeholder="value"
                      value={variable.value}
                      onChange={(e) => updateVariable(idx, 'value', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVariable(idx)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Protection Rules</p>
                    <p className="text-xs text-gray-400">Require approval before deployment</p>
                  </div>
                </div>
                <Switch
                  checked={formData.protection_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, protection_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Auto Deploy</p>
                    <p className="text-xs text-gray-400">Deploy automatically on success</p>
                  </div>
                </div>
                <Switch
                  checked={formData.auto_deploy}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_deploy: checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={resetForm} className="border-white/10 text-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-orange-500 to-pink-500">
                  {editingEnv ? 'Update' : 'Create'} Environment
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Environments List */}
      <div className="grid gap-4">
        {environments.map((env, idx) => {
          const colors = colorOptions[env.type];
          return (
            <motion.div
              key={env.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: colors.light }}
                    >
                      <Server className="w-6 h-6" style={{ color: colors.bg }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{env.name}</h3>
                      <p className="text-xs text-gray-400">{env.deployment_url || 'No URL configured'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: colors.light, color: colors.bg }}
                    >
                      {env.type}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(env)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(env.id)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    {env.protection_enabled ? (
                      <>
                        <Shield className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300">Protected</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">No Protection</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {env.auto_deploy ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Auto Deploy</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Manual Deploy</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {env.variables?.length || 0} variables
                  </div>
                </div>

                {env.variables?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Variables</p>
                    <div className="grid gap-2">
                      {env.variables.map((variable, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <span className="text-sm font-mono text-blue-400">{variable.key}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">{variable.value}</span>
                            {variable.encrypted && <Lock className="w-3 h-3 text-yellow-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}