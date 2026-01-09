import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, Eye, EyeOff, Copy, Trash2, Clock, Server, Shield,
  AlertTriangle, X, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SecretsList({ secrets, environments, showCreate, onCloseCreate }) {
  const queryClient = useQueryClient();
  const [showValues, setShowValues] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    environment_ids: [],
    pipeline_ids: [],
    expires_at: ""
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Secret.create({
      ...data,
      masked_value: `***${data.value.slice(-4)}`,
      last_rotated: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
      onCloseCreate();
      setFormData({ name: "", value: "", description: "", environment_ids: [], pipeline_ids: [], expires_at: "" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Secret.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Secret.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['secrets'])
  });

  const toggleShowValue = (id) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
    
    // Log access
    base44.entities.AuditLog.create({
      event_type: 'secret_viewed',
      actor_id: 'current_user',
      actor_type: 'user',
      entity_type: 'Secret',
      entity_id: id,
      action: 'read',
      status: 'success'
    });
  };

  const copySecret = (value, id) => {
    navigator.clipboard.writeText(value);
    
    // Log access
    base44.entities.AuditLog.create({
      event_type: 'secret_copied',
      actor_id: 'current_user',
      actor_type: 'user',
      entity_type: 'Secret',
      entity_id: id,
      action: 'read',
      status: 'success'
    });
  };

  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return null;
    const days = Math.floor((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: 'expired', color: '#EF4444', text: 'Expired' };
    if (days <= 7) return { status: 'critical', color: '#EF4444', text: `${days}d left` };
    if (days <= 30) return { status: 'warning', color: '#F59E0B', text: `${days}d left` };
    return { status: 'ok', color: '#10B981', text: `${days}d left` };
  };

  return (
    <div className="space-y-6">
      {/* Create Form Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-purple-500/30 p-6"
            style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                Add New Secret
              </h3>
              <Button variant="ghost" size="sm" onClick={onCloseCreate}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-white mb-2 block">Secret Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                  placeholder="DATABASE_URL"
                  className="bg-white/5 border-white/10 text-white font-mono"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Secret Value</Label>
                <Input
                  type="password"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-white mb-2 block">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this secret used for?"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-white mb-2 block">Environments</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {environments.map(env => (
                    <label key={env.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <Checkbox
                        checked={formData.environment_ids.includes(env.id)}
                        onCheckedChange={(checked) => {
                          const ids = checked 
                            ? [...formData.environment_ids, env.id]
                            : formData.environment_ids.filter(id => id !== env.id);
                          setFormData({ ...formData, environment_ids: ids });
                        }}
                      />
                      {env.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-white mb-2 block">Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty for no expiration</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onCloseCreate}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.name || !formData.value || createMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Secret
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secrets List */}
      <div className="space-y-3">
        {secrets.map((secret, idx) => {
          const expStatus = getExpirationStatus(secret.expires_at);
          
          return (
            <motion.div
              key={secret.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-all"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-mono flex items-center gap-2">
                      {secret.name}
                      {secret.active === false && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Inactive</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-400">{secret.description || 'No description'}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {secret.environment_ids?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          {secret.environment_ids.length} env(s)
                        </span>
                      )}
                      {secret.last_rotated && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Rotated {new Date(secret.last_rotated).toLocaleDateString()}
                        </span>
                      )}
                      {expStatus && (
                        <span className="flex items-center gap-1" style={{ color: expStatus.color }}>
                          <AlertTriangle className="w-3 h-3" />
                          {expStatus.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Value display */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 font-mono text-sm">
                    <span className="text-gray-400">
                      {showValues[secret.id] ? secret.value : secret.masked_value || '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowValue(secret.id)}
                      className="h-6 w-6 p-0 text-gray-400"
                    >
                      {showValues[secret.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySecret(secret.value, secret.id)}
                      className="h-6 w-6 p-0 text-gray-400"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(secret.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {secrets.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-white/10 bg-white/5">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Secrets Yet</h3>
            <p className="text-gray-400 mb-4">Add your first secret to get started</p>
            <Button onClick={onCloseCreate} className="bg-purple-500/20 text-purple-400">
              <Key className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}