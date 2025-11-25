import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, AlertTriangle, Rocket, GitCommit, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PromotionManager({ environments, runs, configs }) {
  const queryClient = useQueryClient();
  const [selectedRun, setSelectedRun] = useState("");
  const [targetEnv, setTargetEnv] = useState("");

  const successfulRuns = runs.filter(r => r.status === 'success').slice(0, 20);

  const promoteMutation = useMutation({
    mutationFn: async ({ runId, targetEnvId }) => {
      const sourceRun = runs.find(r => r.id === runId);
      const targetEnv = environments.find(e => e.id === targetEnvId);
      
      // Create promotion run
      await base44.entities.PipelineRun.create({
        pipeline_config_id: sourceRun.pipeline_config_id,
        status: 'pending',
        branch: sourceRun.branch,
        commit: sourceRun.commit,
        triggered_by: `Promotion to ${targetEnv.name}`,
        trigger_type: 'manual',
        steps: [
          { name: 'Validation', status: 'pending' },
          { name: 'Pre-promotion checks', status: 'pending' },
          { name: `Deploy to ${targetEnv.name}`, status: 'pending' },
          { name: 'Post-deployment verification', status: 'pending' }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipelineRuns']);
      setSelectedRun("");
      setTargetEnv("");
    }
  });

  // Sort environments by type for promotion flow
  const envOrder = { development: 0, staging: 1, production: 2, custom: 3 };
  const sortedEnvs = [...environments].sort((a, b) => envOrder[a.type] - envOrder[b.type]);

  const getEnvColor = (type) => ({
    development: '#00B4D8',
    staging: '#F59E0B',
    production: '#10B981',
    custom: '#8B5CF6'
  }[type] || '#6B7280');

  return (
    <div className="space-y-6">
      {/* Promotion Pipeline Visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      >
        <h3 className="text-lg font-bold text-white mb-6">Promotion Pipeline</h3>
        
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {sortedEnvs.map((env, idx) => (
            <React.Fragment key={env.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="min-w-[140px] p-4 rounded-xl border text-center"
                style={{
                  background: `${getEnvColor(env.type)}10`,
                  borderColor: `${getEnvColor(env.type)}30`
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                     style={{ background: `${getEnvColor(env.type)}20` }}>
                  {env.protection_enabled ? (
                    <Shield className="w-5 h-5" style={{ color: getEnvColor(env.type) }} />
                  ) : (
                    <Rocket className="w-5 h-5" style={{ color: getEnvColor(env.type) }} />
                  )}
                </div>
                <p className="font-semibold text-white text-sm">{env.name}</p>
                <p className="text-xs text-gray-400 capitalize">{env.type}</p>
                {env.protection_enabled && (
                  <span className="text-xs text-orange-400 mt-1 block">Approval Required</span>
                )}
              </motion.div>
              
              {idx < sortedEnvs.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gray-500 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Promotion Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            Promote Build
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Select Successful Build</label>
              <Select value={selectedRun} onValueChange={setSelectedRun}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a build to promote" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                  {successfulRuns.map(run => {
                    const config = configs.find(c => c.id === run.pipeline_config_id);
                    return (
                      <SelectItem key={run.id} value={run.id} className="text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>{config?.name || 'Pipeline'}</span>
                          <span className="text-gray-400">#{run.run_number || run.id.substring(0, 6)}</span>
                          <span className="text-xs text-gray-500">{run.branch}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Target Environment</label>
              <Select value={targetEnv} onValueChange={setTargetEnv}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select target environment" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {sortedEnvs.map(env => (
                    <SelectItem key={env.id} value={env.id} className="text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: getEnvColor(env.type) }} />
                        {env.name}
                        {env.protection_enabled && <Shield className="w-3 h-3 text-orange-400" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRun && targetEnv && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <GitCommit className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">Promotion Summary</span>
                </div>
                <p className="text-xs text-gray-400">
                  Build {selectedRun.substring(0, 8)} → {environments.find(e => e.id === targetEnv)?.name}
                </p>
              </div>
            )}

            <Button
              onClick={() => promoteMutation.mutate({ runId: selectedRun, targetEnvId: targetEnv })}
              disabled={!selectedRun || !targetEnv || promoteMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Play className="w-4 h-4 mr-2" />
              Promote to {environments.find(e => e.id === targetEnv)?.name || 'Environment'}
            </Button>
          </div>
        </motion.div>

        {/* Recent Promotions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 p-6"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Promotions
          </h3>

          <div className="space-y-3">
            {runs.filter(r => r.triggered_by?.includes('Promotion')).slice(0, 5).map((run, idx) => {
              const config = configs.find(c => c.id === run.pipeline_config_id);
              const targetEnvName = run.triggered_by?.split('to ')[1] || 'Unknown';
              
              return (
                <div key={run.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {run.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {run.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {run.status === 'running' && <Clock className="w-4 h-4 text-orange-400 animate-pulse" />}
                      <span className="text-sm text-white">{config?.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(run.created_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ArrowRight className="w-3 h-3" />
                    <span>Promoted to {targetEnvName}</span>
                  </div>
                </div>
              );
            })}

            {runs.filter(r => r.triggered_by?.includes('Promotion')).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No promotions yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}