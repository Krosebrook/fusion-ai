/**
 * Prompt Environment Manager - Explicit environment configuration and status
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, AlertCircle, Clock, Activity, Lock, Unlock
} from 'lucide-react';

export function PromptEnvironmentManager() {
  const [environments, setEnvironments] = useState([
    { 
      name: 'development',
      label: 'Development',
      status: 'healthy',
      active_version: null,
      auto_deploy: true,
      quality_gates: {
        syntax_check: true,
        regression_tests: true,
        performance_baseline: false,
        security_scan: false
      }
    },
    { 
      name: 'staging',
      label: 'Staging',
      status: 'healthy',
      active_version: null,
      auto_deploy: false,
      quality_gates: {
        syntax_check: true,
        regression_tests: true,
        performance_baseline: true,
        security_scan: true
      }
    },
    { 
      name: 'production',
      label: 'Production',
      status: 'healthy',
      active_version: null,
      auto_deploy: false,
      quality_gates: {
        syntax_check: true,
        regression_tests: true,
        performance_baseline: true,
        security_scan: true,
        manual_approval: true
      }
    }
  ]);

  const { data: deployments = [] } = useQuery({
    queryKey: ['prompt-deployments'],
    queryFn: () => base44.entities.PipelineRun?.filter?.({ 
      triggered_by: 'prompt_deployment' 
    }) || []
  });

  const getEnvironmentColor = (env) => {
    const colors = {
      development: 'from-blue-500 to-cyan-500',
      staging: 'from-yellow-500 to-orange-500',
      production: 'from-green-500 to-emerald-500'
    };
    return colors[env] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (status) => {
    return status === 'healthy' ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : status === 'degraded' ? (
      <AlertCircle className="w-5 h-5 text-yellow-400" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-400" />
    );
  };

  const toggleAutoDeployment = (envName) => {
    setEnvironments(prev => prev.map(env => 
      env.name === envName 
        ? { ...env, auto_deploy: !env.auto_deploy }
        : env
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {environments.map((env, idx) => (
          <motion.div
            key={env.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getEnvironmentColor(env.name)} flex items-center justify-center`}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{env.label}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(env.status)}
                      <span className="text-xs text-white/60">{env.status}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleAutoDeployment(env.name)}
                  className="text-white/60"
                >
                  {env.auto_deploy ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </Button>
              </div>

              {/* Active Version */}
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Active Version</p>
                <p className="text-white font-mono text-sm">
                  {env.active_version || 'None deployed'}
                </p>
              </div>

              {/* Quality Gates */}
              <div>
                <p className="text-white/60 text-xs mb-2">Quality Gates</p>
                <div className="space-y-1">
                  {Object.entries(env.quality_gates).map(([gate, enabled]) => (
                    <div key={gate} className="flex items-center justify-between text-xs">
                      <span className="text-white/60 capitalize">
                        {gate.replace(/_/g, ' ')}
                      </span>
                      {enabled ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Deployments */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs mb-2">Recent Deployments</p>
                <div className="space-y-1">
                  {deployments
                    .filter(d => d.environment === env.name)
                    .slice(0, 3)
                    .map(d => (
                      <div key={d.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/60">
                          {new Date(d.created_date).toLocaleTimeString()}
                        </span>
                        <Badge className={`text-xs ${
                          d.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {d.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}