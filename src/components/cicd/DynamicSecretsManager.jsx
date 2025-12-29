/**
 * Dynamic Secrets Manager
 * Manages pipeline secrets with vault integration and rotation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function DynamicSecretsManager({ pipelineId, secrets = [], onSecretsChange }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSecret, setNewSecret] = useState({
    name: '',
    source: 'base44_secrets',
    path: '',
    rotation_enabled: false,
    rotation_interval_days: 90,
  });
  const [revealedSecrets, setRevealedSecrets] = useState(new Set());

  const secretSources = [
    { value: 'base44_secrets', label: 'Base44 Secrets', icon: '🔐' },
    { value: 'vault', label: 'HashiCorp Vault', icon: '🏦' },
    { value: 'aws_secrets_manager', label: 'AWS Secrets Manager', icon: '☁️' },
    { value: 'azure_key_vault', label: 'Azure Key Vault', icon: '🔷' },
    { value: 'google_secret_manager', label: 'Google Secret Manager', icon: '📊' },
  ];

  const addSecret = () => {
    if (!newSecret.name || !newSecret.path) {
      toast.error('Secret name and path are required');
      return;
    }

    const updated = [...secrets, { ...newSecret, id: Date.now() }];
    onSecretsChange(updated);
    setNewSecret({
      name: '',
      source: 'base44_secrets',
      path: '',
      rotation_enabled: false,
      rotation_interval_days: 90,
    });
    setShowAddForm(false);
    toast.success('Secret configured');
  };

  const removeSecret = (id) => {
    onSecretsChange(secrets.filter(s => s.id !== id));
    toast.success('Secret removed');
  };

  const toggleReveal = (id) => {
    const updated = new Set(revealedSecrets);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setRevealedSecrets(updated);
  };

  const rotateSecret = async (secret) => {
    toast.info(`🔄 Rotating ${secret.name}...`);
    // In production, this would trigger actual secret rotation
    setTimeout(() => {
      toast.success(`✅ ${secret.name} rotated successfully`);
    }, 1500);
  };

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Dynamic Secrets</h3>
            <p className="text-white/60 text-sm">External vault integration with auto-rotation</p>
          </div>
        </div>
        <CinematicButton
          icon={Plus}
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'outline' : 'primary'}
        >
          {showAddForm ? 'Cancel' : 'Add Secret'}
        </CinematicButton>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2">Secret Name</Label>
                  <Input
                    value={newSecret.name}
                    onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                    placeholder="DATABASE_PASSWORD"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2">Source</Label>
                  <Select
                    value={newSecret.source}
                    onValueChange={(source) => setNewSecret({ ...newSecret, source })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {secretSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.icon} {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label className="text-white mb-2">Secret Path</Label>
                  <Input
                    value={newSecret.path}
                    onChange={(e) => setNewSecret({ ...newSecret, path: e.target.value })}
                    placeholder="prod/database/postgres/password"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={newSecret.rotation_enabled}
                      onCheckedChange={(checked) =>
                        setNewSecret({ ...newSecret, rotation_enabled: checked })
                      }
                    />
                    <span className="text-white text-sm">Enable Auto-Rotation</span>
                  </div>
                  {newSecret.rotation_enabled && (
                    <div className="flex items-center gap-2">
                      <Label className="text-white text-sm">Every</Label>
                      <Input
                        type="number"
                        value={newSecret.rotation_interval_days}
                        onChange={(e) =>
                          setNewSecret({
                            ...newSecret,
                            rotation_interval_days: parseInt(e.target.value),
                          })
                        }
                        className="bg-white/5 border-white/10 text-white w-20"
                      />
                      <span className="text-white text-sm">days</span>
                    </div>
                  )}
                </div>
              </div>

              <CinematicButton icon={Plus} onClick={addSecret} glow>
                Add Secret
              </CinematicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {secrets.map((secret) => (
          <motion.div
            key={secret.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{secret.name}</span>
                    <Badge variant="outline" className="text-xs text-white/60">
                      {secretSources.find(s => s.value === secret.source)?.label}
                    </Badge>
                    {secret.rotation_enabled && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        Auto-Rotate: {secret.rotation_interval_days}d
                      </Badge>
                    )}
                  </div>
                  <div className="text-white/60 text-sm font-mono">
                    {revealedSecrets.has(secret.id) ? secret.path : '••••••••••••'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CinematicButton
                  variant="ghost"
                  size="sm"
                  icon={revealedSecrets.has(secret.id) ? EyeOff : Eye}
                  onClick={() => toggleReveal(secret.id)}
                />
                {secret.rotation_enabled && (
                  <CinematicButton
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => rotateSecret(secret)}
                  />
                )}
                <CinematicButton
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeSecret(secret.id)}
                />
              </div>
            </div>
          </motion.div>
        ))}

        {secrets.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No secrets configured. Add your first secret to get started.
          </div>
        )}
      </div>
    </CinematicCard>
  );
}

export default DynamicSecretsManager;