/**
 * PM Sync Status Dashboard
 * Monitor and manage project management tool integrations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Badge } from '@/components/ui/badge';
import { useEntity } from '../hooks/useEntity';
import { pmIntegrationService } from '../services/PMIntegrationService';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  GitMerge,
  Download,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PM_PROVIDERS = {
  jira: { name: 'Jira', icon: '🔷', color: 'from-blue-500 to-blue-600' },
  asana: { name: 'Asana', icon: '🎯', color: 'from-pink-500 to-red-500' },
  linear: { name: 'Linear', icon: '⚡', color: 'from-purple-500 to-indigo-600' },
  trello: { name: 'Trello', icon: '📋', color: 'from-blue-400 to-cyan-500' },
  clickup: { name: 'ClickUp', icon: '✅', color: 'from-purple-400 to-pink-500' },
  notion: { name: 'Notion', icon: '📝', color: 'from-gray-600 to-gray-800' },
};

export function PMSyncStatusDashboard({ pluginInstallation }) {
  const [syncing, setSyncing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: syncLogs, refetch } = useEntity({
    entityName: 'PMSyncLog',
    filters: { plugin_installation_id: pluginInstallation.id },
    sort: '-created_date',
    limit: 20,
  });

  const pmConfig = pluginInstallation.configuration?.pm_sync;
  const provider = PM_PROVIDERS[pmConfig?.provider] || PM_PROVIDERS.jira;

  const handleManualSync = async () => {
    setSyncing(true);
    toast.info('🔄 Starting sync...');

    try {
      const result = await pmIntegrationService.performSync(pluginInstallation);
      
      toast.success(
        `✅ Sync complete! ${result.imported} imported, ${result.exported} exported, ${result.conflicts} conflicts`
      );
      
      refetch();
    } catch (error) {
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[status] || colors.in_progress;
  };

  const getStatusIcon = (status) => {
    const icons = {
      in_progress: Clock,
      completed: CheckCircle,
      failed: AlertCircle,
      partial: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  // Calculate stats
  const stats = syncLogs?.reduce(
    (acc, log) => {
      acc.totalSyncs++;
      acc.totalImported += log.items_imported || 0;
      acc.totalExported += log.items_exported || 0;
      acc.totalConflicts += log.conflicts_detected || 0;
      if (log.status === 'completed') acc.successful++;
      if (log.status === 'failed') acc.failed++;
      return acc;
    },
    { totalSyncs: 0, totalImported: 0, totalExported: 0, totalConflicts: 0, successful: 0, failed: 0 }
  ) || { totalSyncs: 0, totalImported: 0, totalExported: 0, totalConflicts: 0, successful: 0, failed: 0 };

  // Chart data
  const chartData = syncLogs?.slice(0, 10).reverse().map((log) => ({
    date: new Date(log.created_date).toLocaleDateString(),
    imported: log.items_imported || 0,
    exported: log.items_exported || 0,
    conflicts: log.conflicts_detected || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl shadow-lg`}>
            {provider.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{provider.name} Sync Status</h2>
            <p className="text-white/60 text-sm">Real-time synchronization monitoring</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <CinematicButton
            variant="secondary"
            icon={ExternalLink}
            onClick={() => window.open(`https://${pmConfig?.provider}.com`, '_blank')}
          >
            Open {provider.name}
          </CinematicButton>
          <CinematicButton
            icon={RefreshCw}
            onClick={handleManualSync}
            disabled={syncing}
            glow
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </CinematicButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <CinematicCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Total Syncs</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSyncs}</div>
          <div className="text-green-400 text-sm mt-1">
            {stats.successful} successful
          </div>
        </CinematicCard>

        <CinematicCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-5 h-5 text-blue-400" />
            <span className="text-white/60 text-sm">Imported</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalImported}</div>
          <div className="text-white/60 text-sm mt-1">items imported</div>
        </CinematicCard>

        <CinematicCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-orange-400" />
            <span className="text-white/60 text-sm">Exported</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalExported}</div>
          <div className="text-white/60 text-sm mt-1">items exported</div>
        </CinematicCard>

        <CinematicCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <GitMerge className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Conflicts</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalConflicts}</div>
          <div className="text-yellow-400 text-sm mt-1">need resolution</div>
        </CinematicCard>
      </div>

      {/* Chart */}
      <CinematicCard className="p-6">
        <h3 className="text-white font-semibold mb-4">Sync Activity (Last 10)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="imported" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="exported" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="conflicts" stroke="#eab308" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CinematicCard>

      {/* Sync Logs */}
      <CinematicCard className="p-6">
        <h3 className="text-white font-semibold mb-4">Recent Sync Logs</h3>
        <div className="space-y-3">
          {syncLogs?.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <span className="text-white font-medium">{log.direction}</span>
                </div>
                <span className="text-white/60 text-sm">
                  {new Date(log.created_date).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Imported:</span>
                  <span className="text-blue-400 ml-2 font-semibold">{log.items_imported || 0}</span>
                </div>
                <div>
                  <span className="text-white/60">Exported:</span>
                  <span className="text-orange-400 ml-2 font-semibold">{log.items_exported || 0}</span>
                </div>
                <div>
                  <span className="text-white/60">Conflicts:</span>
                  <span className="text-yellow-400 ml-2 font-semibold">{log.conflicts_detected || 0}</span>
                </div>
              </div>

              {log.duration_ms && (
                <div className="text-white/60 text-xs mt-2">
                  Duration: {(log.duration_ms / 1000).toFixed(2)}s
                </div>
              )}

              {log.conflicts && log.conflicts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-yellow-400 text-sm font-semibold mb-2">
                    Conflicts Detected:
                  </div>
                  <div className="space-y-2">
                    {log.conflicts.slice(0, 3).map((conflict, idx) => (
                      <div key={idx} className="bg-yellow-500/10 rounded-lg p-2 text-xs">
                        <div className="text-white font-medium mb-1">{conflict.field}</div>
                        {conflict.ai_suggestion && (
                          <div className="text-white/70">
                            💡 AI: {conflict.ai_suggestion} ({(conflict.ai_confidence * 100).toFixed(0)}% confidence)
                          </div>
                        )}
                      </div>
                    ))}
                    {log.conflicts.length > 3 && (
                      <div className="text-white/60 text-xs">
                        +{log.conflicts.length - 3} more conflicts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {(!syncLogs || syncLogs.length === 0) && (
            <div className="text-center py-8 text-white/60">
              No sync logs yet. Click "Sync Now" to start your first sync.
            </div>
          )}
        </div>
      </CinematicCard>
    </div>
  );
}

export default PMSyncStatusDashboard;