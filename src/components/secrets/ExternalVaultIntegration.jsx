import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Cloud, CheckCircle2, XCircle, Settings, Link2, RefreshCw, Lock, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ExternalVaultIntegration() {
  const [vaults, setVaults] = useState([
    {
      id: 'hashicorp',
      name: 'HashiCorp Vault',
      description: 'Industry-standard secrets management',
      icon: '🔐',
      status: 'disconnected',
      config: { url: '', token: '', namespace: '' }
    },
    {
      id: 'aws',
      name: 'AWS Secrets Manager',
      description: 'Native AWS secrets integration',
      icon: '☁️',
      status: 'disconnected',
      config: { region: '', accessKey: '', secretKey: '' }
    },
    {
      id: 'azure',
      name: 'Azure Key Vault',
      description: 'Microsoft Azure secrets storage',
      icon: '🔷',
      status: 'disconnected',
      config: { vaultUrl: '', clientId: '', clientSecret: '', tenantId: '' }
    },
    {
      id: 'gcp',
      name: 'Google Secret Manager',
      description: 'Google Cloud Platform secrets',
      icon: '🌈',
      status: 'disconnected',
      config: { projectId: '', serviceAccount: '' }
    }
  ]);

  const [configuring, setConfiguring] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState({});

  const updateVaultConfig = (vaultId, field, value) => {
    setVaults(vaults.map(v => 
      v.id === vaultId 
        ? { ...v, config: { ...v.config, [field]: value } }
        : v
    ));
  };

  const connectVault = (vaultId) => {
    // In production, this would test the connection
    setVaults(vaults.map(v =>
      v.id === vaultId
        ? { ...v, status: 'connected' }
        : v
    ));
    setConfiguring(null);
  };

  const disconnectVault = (vaultId) => {
    setVaults(vaults.map(v =>
      v.id === vaultId
        ? { ...v, status: 'disconnected', config: {} }
        : v
    ));
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          External Secrets Management
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Connect to enterprise secrets managers for centralized credential storage, 
          automatic rotation, and compliance auditing.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Connected Vaults', value: vaults.filter(v => v.status === 'connected').length, color: '#10B981' },
            { label: 'Synced Secrets', value: 0, color: '#00B4D8' },
            { label: 'Auto-Rotation', value: 'Enabled', color: '#8B5CF6' },
            { label: 'Sync Status', value: 'Healthy', color: '#10B981' }
          ].map(stat => (
            <div key={stat.label} className="p-3 rounded-lg bg-white/5">
              <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Vault Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaults.map((vault, idx) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border p-6 ${
              vault.status === 'connected' ? 'border-green-500/30' : 'border-white/10'
            }`}
            style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{vault.icon}</span>
                <div>
                  <h4 className="font-semibold text-white">{vault.name}</h4>
                  <p className="text-xs text-gray-400">{vault.description}</p>
                </div>
              </div>
              {vault.status === 'connected' ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <XCircle className="w-4 h-4" />
                  Not Connected
                </span>
              )}
            </div>

            {configuring === vault.id ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                {vault.id === 'hashicorp' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-400">Vault URL</Label>
                      <Input
                        value={vault.config.url || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'url', e.target.value)}
                        placeholder="https://vault.example.com:8200"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Token</Label>
                      <Input
                        type="password"
                        value={vault.config.token || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'token', e.target.value)}
                        placeholder="hvs.xxxxx"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Namespace (optional)</Label>
                      <Input
                        value={vault.config.namespace || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'namespace', e.target.value)}
                        placeholder="admin"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </>
                )}

                {vault.id === 'aws' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-400">Region</Label>
                      <Input
                        value={vault.config.region || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'region', e.target.value)}
                        placeholder="us-east-1"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Access Key ID</Label>
                      <Input
                        value={vault.config.accessKey || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'accessKey', e.target.value)}
                        placeholder="AKIA..."
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Secret Access Key</Label>
                      <Input
                        type="password"
                        value={vault.config.secretKey || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'secretKey', e.target.value)}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </>
                )}

                {vault.id === 'azure' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-400">Vault URL</Label>
                      <Input
                        value={vault.config.vaultUrl || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'vaultUrl', e.target.value)}
                        placeholder="https://myvault.vault.azure.net"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Client ID</Label>
                      <Input
                        value={vault.config.clientId || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'clientId', e.target.value)}
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Client Secret</Label>
                      <Input
                        type="password"
                        value={vault.config.clientSecret || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'clientSecret', e.target.value)}
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </>
                )}

                {vault.id === 'gcp' && (
                  <>
                    <div>
                      <Label className="text-xs text-gray-400">Project ID</Label>
                      <Input
                        value={vault.config.projectId || ''}
                        onChange={(e) => updateVaultConfig(vault.id, 'projectId', e.target.value)}
                        placeholder="my-project-123"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Service Account JSON</Label>
                      <Input
                        type="file"
                        accept=".json"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => connectVault(vault.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  <Button
                    onClick={() => setConfiguring(null)}
                    variant="outline"
                    className="border-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : vault.status === 'connected' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Sync Active</span>
                  </div>
                  <Switch 
                    checked={syncEnabled[vault.id] || false}
                    onCheckedChange={(checked) => setSyncEnabled({ ...syncEnabled, [vault.id]: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setConfiguring(vault.id)}
                    variant="outline"
                    className="flex-1 border-white/10 text-gray-300"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    onClick={() => disconnectVault(vault.id)}
                    variant="outline"
                    className="border-red-500/30 text-red-400"
                    size="sm"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setConfiguring(vault.id)}
                className="w-full bg-white/10 text-white hover:bg-white/20"
              >
                <Key className="w-4 h-4 mr-2" />
                Configure Connection
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sync Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-400" />
          Sync Configuration
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Bi-directional Sync</p>
              <p className="text-xs text-gray-400">Sync secrets both ways between FlashFusion and external vaults</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Auto-import New Secrets</p>
              <p className="text-xs text-gray-400">Automatically import new secrets from connected vaults</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Conflict Resolution</p>
              <p className="text-xs text-gray-400">How to handle conflicts when secrets exist in both systems</p>
            </div>
            <select className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white">
              <option value="external">External wins</option>
              <option value="local">Local wins</option>
              <option value="newest">Newest wins</option>
              <option value="manual">Manual review</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );
}