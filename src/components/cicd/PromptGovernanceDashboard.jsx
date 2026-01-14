/**
 * Prompt Governance Dashboard - Compliance monitoring and policy enforcement
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Users, BarChart3, Settings
} from 'lucide-react';

export function PromptGovernanceDashboard() {
  const [selectedEnv, setSelectedEnv] = useState('all');

  const { data: deployments = [] } = useQuery({
    queryKey: ['prompt-deployments'],
    queryFn: () => base44.entities.PipelineRun?.filter?.({ 
      triggered_by: 'prompt_deployment' 
    }) || []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['prompt-reviews'],
    queryFn: () => base44.entities.PromptTemplateVersion?.list?.('-created_at', 100) || []
  });

  // Calculate compliance metrics
  const metrics = {
    total: deployments.length,
    compliant: deployments.filter(d => d.deployment_config?.compliance_passed).length,
    pending_review: reviews.filter(r => !r.reviewed_at).length,
    violations: deployments.filter(d => d.deployment_config?.policy_violations?.length > 0).length
  };

  const complianceRate = metrics.total > 0 
    ? ((metrics.compliant / metrics.total) * 100).toFixed(1)
    : 0;

  // Environment status
  const envStatus = ['development', 'staging', 'production'].map(env => {
    const envDeployments = deployments.filter(d => d.environment === env);
    const compliant = envDeployments.filter(d => d.deployment_config?.compliance_passed).length;
    return {
      env,
      total: envDeployments.length,
      compliant,
      rate: envDeployments.length > 0 ? ((compliant / envDeployments.length) * 100).toFixed(1) : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Prompt Governance</h1>
          <p className="text-white/60">Policy enforcement and compliance monitoring</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Settings className="w-4 h-4 mr-2" />
          Configure Policies
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Deployments', value: metrics.total, icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
          { label: 'Compliant', value: metrics.compliant, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Pending Review', value: metrics.pending_review, icon: Users, color: 'from-yellow-500 to-orange-500' },
          { label: 'Violations', value: metrics.violations, icon: AlertTriangle, color: 'from-red-500 to-pink-500' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {/* Compliance Rate */}
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Compliance Rate</h2>
          <Badge className={`text-lg ${
            complianceRate >= 95 ? 'bg-green-500/20 text-green-300' :
            complianceRate >= 80 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
          }`}>
            {complianceRate}%
          </Badge>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${complianceRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              complianceRate >= 95 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              complianceRate >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
          />
        </div>
      </CinematicCard>

      {/* Environment Status */}
      <CinematicCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Environment Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {envStatus.map((env, idx) => (
            <motion.div
              key={env.env}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold capitalize">{env.env}</p>
                <Shield className={`w-5 h-5 ${
                  env.rate >= 95 ? 'text-green-400' :
                  env.rate >= 80 ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Deployments</span>
                  <span className="text-white">{env.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Compliant</span>
                  <span className="text-green-400">{env.compliant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Rate</span>
                  <span className="text-white font-bold">{env.rate}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CinematicCard>

      {/* Recent Violations */}
      <CinematicCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Recent Violations
        </h2>
        <div className="space-y-2">
          {deployments
            .filter(d => d.deployment_config?.policy_violations?.length > 0)
            .slice(0, 5)
            .map((deployment, idx) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {deployment.deployment_config.prompt_version_id?.slice(0, 8)}
                    </p>
                    <p className="text-white/60 text-xs capitalize">{deployment.environment}</p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 text-xs">
                    {deployment.deployment_config.policy_violations.length} violations
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {deployment.deployment_config.policy_violations.slice(0, 2).map((v, i) => (
                    <li key={i} className="text-red-300 text-xs flex items-start gap-2">
                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
        </div>
      </CinematicCard>
    </div>
  );
}