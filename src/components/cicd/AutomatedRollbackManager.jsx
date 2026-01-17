/**
 * Automated Rollback Manager
 * Manage and trigger automatic rollbacks for failed deployments
 */
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { RotateCcw, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function AutomatedRollbackManager() {
  const queryClient = useQueryClient();

  const { data: deployments = [] } = useQuery({
    queryKey: ['deployments-with-health'],
    queryFn: async () => {
      const result = await base44.functions.invoke('getDeploymentHealth', {});
      return result?.deployments || [];
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (deploymentId) => {
      const result = await base44.functions.invoke('triggerAutomatedRollback', {
        deploymentId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments-with-health'] });
      toast.success('Rollback initiated');
    },
    onError: () => {
      toast.error('Rollback failed');
    },
  });

  const atRisk = deployments.filter(d => d.healthScore < 70);
  const healthy = deployments.filter(d => d.healthScore >= 70);

  return (
    <div className="space-y-6">
      {/* Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <CinematicCard className="p-6">
          <p className="text-white/60 text-sm mb-2">Total Deployments</p>
          <p className="text-3xl font-bold text-cyan-400">{deployments.length}</p>
        </CinematicCard>

        <CinematicCard className="p-6 bg-green-500/10 border-green-500/30">
          <p className="text-white/60 text-sm mb-2">Healthy</p>
          <p className="text-3xl font-bold text-green-400">{healthy.length}</p>
        </CinematicCard>

        <CinematicCard className={`p-6 ${
          atRisk.length > 0
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <p className="text-white/60 text-sm mb-2">At Risk</p>
          <p className={`text-3xl font-bold ${
            atRisk.length > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {atRisk.length}
          </p>
        </CinematicCard>
      </motion.div>

      {/* At-Risk Deployments */}
      {atRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CinematicCard className="p-6 bg-red-500/10 border-red-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              Deployments Requiring Attention
            </h3>

            <div className="space-y-3">
              {atRisk.map((deployment, idx) => (
                <motion.div
                  key={deployment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-red-500/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{deployment.name}</p>
                      <p className="text-xs text-white/60 mt-1">
                        Environment: {deployment.environment}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-400">
                        {deployment.healthScore}%
                      </p>
                      <p className="text-xs text-white/60">Health Score</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3 text-xs">
                    {deployment.issues?.map((issue, i) => (
                      <p key={i} className="text-white/70">
                        • {issue}
                      </p>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {deployment.canAutoRollback && (
                      <Button
                        onClick={() => rollbackMutation.mutate(deployment.id)}
                        disabled={rollbackMutation.isPending}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
                        size="sm"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback Now'}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        // Open detailed diagnostics
                      }}
                      variant="outline"
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CinematicCard>
        </motion.div>
      )}

      {/* Healthy Deployments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CinematicCard className="p-6 bg-green-500/10 border-green-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Healthy Deployments
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthy.map((deployment, idx) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg bg-white/5 border border-green-500/30"
              >
                <p className="font-semibold text-white text-sm">{deployment.name}</p>
                <p className="text-xs text-green-400/80 mt-1">
                  Health: {deployment.healthScore}% • {deployment.environment}
                </p>
              </motion.div>
            ))}
          </div>
        </CinematicCard>
      </motion.div>
    </div>
  );
}