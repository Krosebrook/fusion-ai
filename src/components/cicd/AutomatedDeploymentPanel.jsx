/**
 * Automated Deployment & Rollback Panel
 * Manages staging deployments with one-click rollback
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, RotateCcw, CheckCircle, XCircle, Clock, ExternalLink, AlertTriangle } from 'lucide-react';

export function AutomatedDeploymentPanel({ pipelineId }) {
  const queryClient = useQueryClient();

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', pipelineId],
    queryFn: () => base44.entities.PipelineRun.filter(
      { pipeline_id: pipelineId, environment: 'staging' },
      '-completed_at',
      10
    )
  });

  const deployMutation = useMutation({
    mutationFn: async (runId) => {
      const response = await base44.functions.invoke('deployStagingAuto', { 
        pipelineRunId: runId, 
        action: 'deploy' 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', pipelineId] });
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: async (runId) => {
      const response = await base44.functions.invoke('deployStagingAuto', { 
        pipelineRunId: runId, 
        action: 'rollback' 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments', pipelineId] });
    }
  });

  const currentDeployment = deployments.find(d => d.status === 'deployed');
  const previousDeployments = deployments.filter(d => d.id !== currentDeployment?.id);

  return (
    <div className="space-y-6">
      {/* Current Deployment */}
      {currentDeployment && (
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Current Staging Deployment</h3>
                <p className="text-white/60 text-sm">Live on staging environment</p>
              </div>
            </div>
            <Badge className="bg-green-500">Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-white/60 text-sm">Branch</p>
              <p className="text-white font-medium">{currentDeployment.branch}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Deployed</p>
              <p className="text-white font-medium">
                {new Date(currentDeployment.metadata?.deployedAt || currentDeployment.completed_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Duration</p>
              <p className="text-white font-medium">{currentDeployment.duration || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open(currentDeployment.deployment_url, '_blank')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Staging Site
            </Button>

            <Button
              onClick={() => rollbackMutation.mutate(currentDeployment.id)}
              disabled={rollbackMutation.isPending || !previousDeployments.length}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback'}
            </Button>
          </div>
        </CinematicCard>
      )}

      {/* Deployment History */}
      <CinematicCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Deployment History</h3>

        <div className="space-y-3">
          {deployments.map((deployment, idx) => {
            const isCurrent = deployment.id === currentDeployment?.id;
            const status = deployment.status;

            return (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border ${
                  isCurrent 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {status === 'deployed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {status === 'deployment_failed' && <XCircle className="w-5 h-5 text-red-400" />}
                    {status === 'rolled_back' && <RotateCcw className="w-5 h-5 text-orange-400" />}
                    {status === 'auto_rolled_back' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    
                    <div>
                      <p className="text-white font-medium">
                        {deployment.branch} • Run #{deployment.run_number}
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(deployment.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={
                      status === 'deployed' ? 'bg-green-500' :
                      status === 'deployment_failed' ? 'bg-red-500' :
                      status === 'rolled_back' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }>
                      {status.replace('_', ' ')}
                    </Badge>

                    {deployment.deployment_url && (
                      <Button
                        onClick={() => window.open(deployment.deployment_url, '_blank')}
                        size="sm"
                        variant="ghost"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {deployment.metadata?.autoRollbackReason && (
                  <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Auto-rollback: {deployment.metadata.autoRollbackReason}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}

          {deployments.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <p>No deployments yet</p>
            </div>
          )}
        </div>
      </CinematicCard>
    </div>
  );
}

export default AutomatedDeploymentPanel;