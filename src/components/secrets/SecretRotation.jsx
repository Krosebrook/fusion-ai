import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Clock, AlertTriangle, CheckCircle2, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SecretRotation({ secrets }) {
  const queryClient = useQueryClient();
  const [rotationPolicies, setRotationPolicies] = useState({});

  const rotateMutation = useMutation({
    mutationFn: async (secretId) => {
      // In production, this would call an external rotation service
      await base44.entities.Secret.update(secretId, {
        last_rotated: new Date().toISOString()
      });
      
      await base44.entities.AuditLog.create({
        event_type: 'secret_rotated',
        actor_id: 'current_user',
        actor_type: 'user',
        entity_type: 'Secret',
        entity_id: secretId,
        action: 'update',
        status: 'success',
        changes: { action: 'rotation' }
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['secrets'])
  });

  const getRotationStatus = (secret) => {
    if (!secret.last_rotated) return { status: 'never', color: '#EF4444', days: null };
    const days = Math.floor((new Date() - new Date(secret.last_rotated)) / (1000 * 60 * 60 * 24));
    if (days >= 90) return { status: 'overdue', color: '#EF4444', days };
    if (days >= 60) return { status: 'warning', color: '#F59E0B', days };
    return { status: 'ok', color: '#10B981', days };
  };

  const rotationIntervals = [
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days (recommended)' },
    { value: '180', label: '180 days' },
    { value: '365', label: '1 year' }
  ];

  const secretsWithStatus = secrets.map(s => ({
    ...s,
    rotationStatus: getRotationStatus(s)
  })).sort((a, b) => {
    const order = { overdue: 0, never: 1, warning: 2, ok: 3 };
    return order[a.rotationStatus.status] - order[b.rotationStatus.status];
  });

  const needsRotation = secretsWithStatus.filter(s => 
    s.rotationStatus.status === 'overdue' || s.rotationStatus.status === 'never'
  );

  return (
    <div className="space-y-6">
      {/* Rotation Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="rounded-xl border border-green-500/30 p-6"
             style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" }}>
          <CheckCircle2 className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-white">
            {secretsWithStatus.filter(s => s.rotationStatus.status === 'ok').length}
          </p>
          <p className="text-sm text-gray-400">Recently Rotated</p>
        </div>

        <div className="rounded-xl border border-orange-500/30 p-6"
             style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)" }}>
          <Clock className="w-8 h-8 text-orange-400 mb-3" />
          <p className="text-2xl font-bold text-white">
            {secretsWithStatus.filter(s => s.rotationStatus.status === 'warning').length}
          </p>
          <p className="text-sm text-gray-400">Due Soon</p>
        </div>

        <div className="rounded-xl border border-red-500/30 p-6"
             style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)" }}>
          <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-2xl font-bold text-white">{needsRotation.length}</p>
          <p className="text-sm text-gray-400">Needs Rotation</p>
        </div>
      </motion.div>

      {/* Urgent Rotations */}
      {needsRotation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-red-500/30 p-6"
          style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Urgent: Secrets Need Rotation
            </h3>
            <Button
              onClick={() => needsRotation.forEach(s => rotateMutation.mutate(s.id))}
              disabled={rotateMutation.isPending}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
              Rotate All
            </Button>
          </div>

          <div className="space-y-2">
            {needsRotation.map(secret => (
              <div key={secret.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                <div>
                  <p className="font-mono text-white">{secret.name}</p>
                  <p className="text-xs text-red-400">
                    {secret.rotationStatus.status === 'never' 
                      ? 'Never rotated' 
                      : `${secret.rotationStatus.days} days since last rotation`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => rotateMutation.mutate(secret.id)}
                  disabled={rotateMutation.isPending}
                  className="bg-red-500/20 text-red-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rotate Now
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Secrets Rotation Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Rotation Policies
        </h3>

        <div className="space-y-3">
          {secretsWithStatus.map((secret, idx) => (
            <motion.div
              key={secret.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ background: secret.rotationStatus.color }} />
                <div>
                  <p className="font-mono text-white">{secret.name}</p>
                  <p className="text-xs text-gray-400">
                    {secret.rotationStatus.days !== null 
                      ? `Last rotated ${secret.rotationStatus.days} days ago`
                      : 'Never rotated'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select
                  value={rotationPolicies[secret.id] || '90'}
                  onValueChange={(v) => setRotationPolicies({ ...rotationPolicies, [secret.id]: v })}
                >
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {rotationIntervals.map(i => (
                      <SelectItem key={i.value} value={i.value} className="text-white">
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Auto-rotate</span>
                  <Switch />
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => rotateMutation.mutate(secret.id)}
                  disabled={rotateMutation.isPending}
                  className="text-purple-400"
                >
                  <RefreshCw className={`w-4 h-4 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}