import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Key, Plus, Copy, Trash2, Eye, AlertCircle, 
  CheckCircle2, Calendar, Activity, Lock
} from "lucide-react";

export default function APIKeyManager() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: ["read_runs"],
    pipeline_ids: [],
    expires_in_days: 90
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => base44.entities.APIKey.list('-created_date')
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Call backend to generate API key securely
      const result = await base44.functions.invoke('createAPIKey', {
        name: data.name,
        permissions: data.permissions,
        pipeline_ids: data.pipeline_ids,
        expires_in_days: data.expires_in_days
      });

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['apiKeys']);
      setNewKey(data.plaintext_key);
      setShowCreate(false);
      setFormData({
        name: "",
        permissions: ["read_runs"],
        pipeline_ids: [],
        expires_in_days: 90
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.APIKey.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['apiKeys'])
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const permissions = [
    { value: 'trigger_pipeline', label: 'Trigger Pipelines', icon: Activity },
    { value: 'read_runs', label: 'Read Pipeline Runs', icon: Eye },
    { value: 'read_config', label: 'Read Configurations', icon: Lock },
    { value: 'webhook', label: 'Webhook Access', icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      {/* New Key Display */}
      <AnimatePresence>
        {newKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="text-lg font-bold text-white">API Key Created Successfully</h4>
                <p className="text-sm text-gray-400">Copy this key now - it won't be shown again</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-black/40 border border-white/10">
              <code className="flex-1 text-sm text-white font-mono">{newKey}</code>
              <Button
                size="sm"
                onClick={() => handleCopy(newKey)}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => setNewKey(null)}
              variant="ghost"
              className="mt-3 text-gray-400"
              size="sm"
            >
              I've saved my key
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-purple-500/30 bg-white/5"
        >
          <h4 className="text-lg font-bold text-white mb-4">Create API Key</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Key Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production CI/CD Integration"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Permissions</Label>
              <div className="space-y-2">
                {permissions.map(perm => (
                  <label key={perm.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition">
                    <Checkbox
                      checked={formData.permissions.includes(perm.value)}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...formData.permissions, perm.value]
                          : formData.permissions.filter(p => p !== perm.value);
                        setFormData({ ...formData, permissions: updated });
                      }}
                    />
                    <perm.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Expiration</Label>
              <Input
                type="number"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
                placeholder="90"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Days until key expires (0 = never)</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || formData.permissions.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Key className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
            <Button
              onClick={() => setShowCreate(false)}
              variant="outline"
              className="border-white/20"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      {!showCreate && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">API Keys</h3>
            <p className="text-sm text-gray-400">Manage external access to your pipelines</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Key
          </Button>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {apiKeys.map((key, idx) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  {key.name}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-1">{key.key_preview}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(key.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {key.usage_count || 0} uses
              </div>
              {key.last_used && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last: {new Date(key.last_used).toLocaleDateString()}
                </div>
              )}
              {key.expires_at && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-orange-400" />
                  Expires: {new Date(key.expires_at).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {key.permissions.map(perm => (
                <span
                  key={perm}
                  className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400"
                >
                  {perm}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {apiKeys.length === 0 && !showCreate && (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No API keys yet</p>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-purple-500/20 text-purple-400"
          >
            Create Your First Key
          </Button>
        </div>
      )}
    </div>
  );
}