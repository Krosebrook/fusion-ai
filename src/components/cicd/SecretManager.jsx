import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Plus, Edit2, Trash2, Eye, EyeOff, AlertTriangle, Clock, Copy, Check } from "lucide-react";

export default function SecretManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null);
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [copiedSecret, setCopiedSecret] = useState(null);

  const { data: secrets = [] } = useQuery({
    queryKey: ['secrets'],
    queryFn: () => base44.entities.Secret.list('-created_date')
  });

  const { data: environments = [] } = useQuery({
    queryKey: ['environments'],
    queryFn: () => base44.entities.Environment.list()
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.list()
  });

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    environment_ids: [],
    pipeline_ids: [],
    expires_at: ""
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const masked = data.value.length > 6 
        ? `***${data.value.slice(-6)}`
        : '***';
      
      return base44.entities.Secret.create({
        ...data,
        masked_value: masked,
        last_rotated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const masked = data.value.length > 6 
        ? `***${data.value.slice(-6)}`
        : '***';
      
      return base44.entities.Secret.update(id, {
        ...data,
        masked_value: masked,
        last_rotated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
      setEditingSecret(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Secret.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['secrets'])
  });

  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      description: "",
      environment_ids: [],
      pipeline_ids: [],
      expires_at: ""
    });
    setShowForm(false);
    setEditingSecret(null);
  };

  const handleSubmit = () => {
    if (formData.name && formData.value) {
      if (editingSecret) {
        updateMutation.mutate({ id: editingSecret.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    }
  };

  const startEdit = (secret) => {
    setEditingSecret(secret);
    setFormData({
      name: secret.name,
      value: secret.value,
      description: secret.description || "",
      environment_ids: secret.environment_ids || [],
      pipeline_ids: secret.pipeline_ids || [],
      expires_at: secret.expires_at || ""
    });
    setShowForm(true);
  };

  const toggleSecretVisibility = (id) => {
    setVisibleSecrets({ ...visibleSecrets, [id]: !visibleSecrets[id] });
  };

  const copySecret = (value, id) => {
    navigator.clipboard.writeText(value);
    setCopiedSecret(id);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.floor((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Secret Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">Securely store API keys, tokens, and credentials</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          New Secret
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-400">Security Notice</p>
          <p className="text-xs text-gray-400 mt-1">
            Secrets are encrypted at rest. Never expose secrets in logs or code. Use environment-specific secrets for sensitive operations.
          </p>
        </div>
      </div>

      {/* Secret Form */}
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
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Secret Name/Key</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                    placeholder="API_KEY"
                    className="bg-white/5 border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-white">Expiration Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.expires_at?.split('T')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Secret Value</Label>
                <Textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Paste your secret value here..."
                  className="bg-white/5 border-white/10 text-white font-mono"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this secret used for?"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Available in Environments</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {environments.map(env => (
                      <label key={env.id} className="flex items-center gap-2 p-2 rounded bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.environment_ids.includes(env.id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.environment_ids, env.id]
                              : formData.environment_ids.filter(id => id !== env.id);
                            setFormData({ ...formData, environment_ids: updated });
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-white">{env.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Available to Pipelines</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pipelines.map(pipeline => (
                      <label key={pipeline.id} className="flex items-center gap-2 p-2 rounded bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pipeline_ids.includes(pipeline.id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...formData.pipeline_ids, pipeline.id]
                              : formData.pipeline_ids.filter(id => id !== pipeline.id);
                            setFormData({ ...formData, pipeline_ids: updated });
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-white">{pipeline.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={resetForm} className="border-white/10 text-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Lock className="w-4 h-4 mr-2" />
                  {editingSecret ? 'Update' : 'Create'} Secret
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets List */}
      <div className="grid gap-4">
        {secrets.map((secret, idx) => {
          const isVisible = visibleSecrets[secret.id];
          const expired = isExpired(secret.expires_at);
          const expiringSoon = isExpiringSoon(secret.expires_at);

          return (
            <motion.div
              key={secret.id}
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
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white font-mono">{secret.name}</h3>
                        {expired && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                            Expired
                          </span>
                        )}
                        {expiringSoon && (
                          <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{secret.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSecretVisibility(secret.id)}
                      className="text-gray-400"
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copySecret(secret.value, secret.id)}
                      className="text-gray-400"
                    >
                      {copiedSecret === secret.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(secret)} className="text-blue-400">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(secret.id)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/20 border border-white/10 mb-4">
                  <p className="text-sm text-white font-mono break-all">
                    {isVisible ? secret.value : secret.masked_value || '***************'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {secret.environment_ids?.map(envId => {
                    const env = environments.find(e => e.id === envId);
                    return env ? (
                      <span key={envId} className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {env.name}
                      </span>
                    ) : null;
                  })}
                  {secret.pipeline_ids?.map(pipelineId => {
                    const pipeline = pipelines.find(p => p.id === pipelineId);
                    return pipeline ? (
                      <span key={pipelineId} className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {pipeline.name}
                      </span>
                    ) : null;
                  })}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last rotated: {new Date(secret.last_rotated || secret.created_date).toLocaleDateString()}
                  </div>
                  {secret.expires_at && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Expires: {new Date(secret.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}