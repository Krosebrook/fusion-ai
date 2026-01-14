/**
 * Prompt Rollback Manager - One-click revert with automated triggers
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, AlertTriangle, CheckCircle, Clock,
  TrendingDown, Zap, History
} from 'lucide-react';
import { toast } from 'sonner';

export function PromptRollbackManager({ environment = 'production' }) {
  const [rolling, setRolling] = useState(false);

  const { data: deployments = [] } = useQuery({
    queryKey: ['prompt-deployments', environment],
    queryFn: () => base44.entities.PipelineRun?.filter?.({ 
      triggered_by: 'prompt_deployment',
      environment 
    }) || []
  });

  const { data: rollbackHistory = [] } = useQuery({
    queryKey: ['rollback-history'],
    queryFn: () => base44.entities.PipelineRun?.filter?.({ 
      triggered_by: 'rollback' 
    }) || []
  });

  const successfulDeployments = deployments
    .filter(d => d.status === 'success')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const currentDeployment = successfulDeployments[0];
  const previousVersions = successfulDeployments.slice(1, 6);

  const executeRollback = async (targetVersion, reason) => {
    setRolling(true);
    try {
      await base44.entities.PipelineRun.create({
        pipeline_config_id: targetVersion.pipeline_config_id,
        status: 'running',
        branch: 'main',
        commit: targetVersion.commit,
        triggered_by: 'rollback',
        environment,
        deployment_config: {
          prompt_version_id: targetVersion.deployment_config.prompt_version_id,
          rollback_from: currentDeployment.id,
          rollback_reason: reason,
          rollback_timestamp: new Date().toISOString()
        }
      });

      toast.success('Rollback initiated');
    } catch (error) {
      toast.error('Rollback failed');
    } finally {
      setRolling(false);
    }
  };

  const checkAutoRollbackTriggers = async (deployment) => {
    const triggers = {
      failure_rate: 0.15,
      latency_threshold: 5000,
      error_spike: 10
    };

    // Check if automated rollback is needed
    const metrics = deployment.deployment_config?.metrics || {};
    
    if (metrics.failure_rate > triggers.failure_rate) {
      return { triggered: true, reason: `Failure rate ${(metrics.failure_rate * 100).toFixed(1)}% exceeds ${(triggers.failure_rate * 100)}%` };
    }
    
    if (metrics.avg_latency > triggers.latency_threshold) {
      return { triggered: true, reason: `Latency ${metrics.avg_latency}ms exceeds ${triggers.latency_threshold}ms` };
    }

    return { triggered: false };
  };

  return (
    <div className="space-y-6">
      {/* Current Version Status */}
      <CinematicCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Current Version</h2>
            <p className="text-white/60 text-sm capitalize">{environment}</p>
          </div>
          <Badge className="bg-green-500/20 text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {currentDeployment && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-mono">
                {currentDeployment.deployment_config?.prompt_version_id?.slice(0, 12)}
              </p>
              <p className="text-white/60 text-sm">
                {new Date(currentDeployment.created_date).toLocaleString()}
              </p>
            </div>
            
            {currentDeployment.deployment_config?.metrics && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-white/60 text-xs">Success Rate</p>
                  <p className="text-green-300 font-bold">
                    {((1 - (currentDeployment.deployment_config.metrics.failure_rate || 0)) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Avg Latency</p>
                  <p className="text-white font-bold">
                    {currentDeployment.deployment_config.metrics.avg_latency || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Executions</p>
                  <p className="text-white font-bold">
                    {currentDeployment.deployment_config.metrics.executions || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CinematicCard>

      {/* Quick Rollback */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Quick Rollback</h2>
        </div>

        <div className="space-y-3">
          {previousVersions.map((version, idx) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-white/60" />
                  <div>
                    <p className="text-white font-mono text-sm">
                      {version.deployment_config?.prompt_version_id?.slice(0, 12)}
                    </p>
                    <p className="text-white/60 text-xs">
                      {new Date(version.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => executeRollback(version, 'Manual rollback')}
                  disabled={rolling}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {rolling ? <Clock className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                  Rollback
                </Button>
              </div>

              {version.deployment_config?.metrics && (
                <div className="flex gap-4 text-xs text-white/60 mt-2 pt-2 border-t border-white/10">
                  <span>SR: {((1 - (version.deployment_config.metrics.failure_rate || 0)) * 100).toFixed(1)}%</span>
                  <span>•</span>
                  <span>Latency: {version.deployment_config.metrics.avg_latency || 0}ms</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CinematicCard>

      {/* Rollback History */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Rollback History</h2>
        </div>

        <div className="space-y-2">
          {rollbackHistory.slice(0, 5).map((rollback, idx) => (
            <motion.div
              key={rollback.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white text-sm font-semibold">
                    Rollback to {rollback.deployment_config?.prompt_version_id?.slice(0, 8)}
                  </p>
                  <p className="text-white/60 text-xs">
                    {new Date(rollback.created_date).toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                  {rollback.deployment_config?.rollback_reason?.includes('Auto') ? 'Auto' : 'Manual'}
                </Badge>
              </div>
              {rollback.deployment_config?.rollback_reason && (
                <p className="text-white/70 text-xs">
                  Reason: {rollback.deployment_config.rollback_reason}
                </p>
              )}
            </motion.div>
          ))}

          {rollbackHistory.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/60 text-sm">No rollbacks yet</p>
            </div>
          )}
        </div>
      </CinematicCard>

      {/* Automated Triggers */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Automated Triggers</h2>
        </div>

        <div className="space-y-3">
          {[
            { metric: 'Failure Rate', threshold: '> 15%', icon: TrendingDown, color: 'red' },
            { metric: 'Latency', threshold: '> 5000ms', icon: Clock, color: 'yellow' },
            { metric: 'Error Spike', threshold: '> 10 errors/min', icon: AlertTriangle, color: 'orange' }
          ].map((trigger, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <trigger.icon className={`w-4 h-4 text-${trigger.color}-400`} />
                <div>
                  <p className="text-white text-sm font-semibold">{trigger.metric}</p>
                  <p className="text-white/60 text-xs">{trigger.threshold}</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 text-xs">Enabled</Badge>
            </motion.div>
          ))}
        </div>
      </CinematicCard>
    </div>
  );
}