/**
 * My Plugins - Manage installed plugins
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { useEntity } from '../components/hooks/useEntity';
import { base44 } from '@/api/base44Client';
import { 
  Settings, 
  Trash2, 
  Activity,
  Key,
  Webhook,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyPluginsPage() {
  const [copied, setCopied] = useState(null);
  
  const { data: installations, refetch } = useEntity({
    entityName: 'PluginInstallation',
  });

  const { data: plugins } = useEntity({
    entityName: 'Plugin',
  });

  const getPlugin = (pluginId) => {
    return plugins?.find(p => p.id === pluginId);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUninstall = async (installation) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return;
    
    try {
      await base44.entities.PluginInstallation.delete(installation.id);
      toast.success('Plugin uninstalled');
      refetch();
    } catch (error) {
      console.error('Failed to uninstall', error);
      toast.error('Failed to uninstall plugin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">My Plugins</h1>
          <p className="text-white/60">Manage your installed plugins and API keys</p>
        </motion.div>

        {!installations || installations.length === 0 ? (
          <CinematicCard className="p-12 text-center">
            <Settings className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No plugins installed</h3>
            <p className="text-white/60 mb-6">Browse the marketplace to get started</p>
            <CinematicButton
              variant="primary"
              onClick={() => window.location.href = '/PluginMarketplace'}
            >
              Browse Marketplace
            </CinematicButton>
          </CinematicCard>
        ) : (
          <div className="space-y-6">
            {installations.map((installation) => {
              const plugin = getPlugin(installation.plugin_id);
              if (!plugin) return null;

              return (
                <motion.div
                  key={installation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CinematicCard className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl flex-shrink-0">
                          {plugin.icon_url ? (
                            <img src={plugin.icon_url} alt={plugin.name} className="w-full h-full rounded-xl" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{plugin.name}</h3>
                          <p className="text-white/60 text-sm mb-2">{plugin.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-1 ${
                              installation.status === 'active' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              <Activity className="w-4 h-4" />
                              {installation.status}
                            </div>
                            <div className="text-white/60">
                              Used {installation.usage_count} times
                            </div>
                            {installation.last_used && (
                              <div className="text-white/40 text-xs">
                                Last used: {new Date(installation.last_used).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <CinematicButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleUninstall(installation)}
                      >
                        Uninstall
                      </CinematicButton>
                    </div>

                    {/* API Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-cyan-400" />
                          <span className="text-white font-semibold text-sm">API Key</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-white/60 text-xs font-mono bg-slate-950/50 px-3 py-2 rounded">
                            {installation.api_key}
                          </code>
                          <button
                            onClick={() => handleCopy(installation.api_key, `api-${installation.id}`)}
                            className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                          >
                            {copied === `api-${installation.id}` ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Webhook className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-semibold text-sm">Webhook Secret</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-white/60 text-xs font-mono bg-slate-950/50 px-3 py-2 rounded truncate">
                            {installation.webhook_secret}
                          </code>
                          <button
                            onClick={() => handleCopy(installation.webhook_secret, `webhook-${installation.id}`)}
                            className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                          >
                            {copied === `webhook-${installation.id}` ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CinematicCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}