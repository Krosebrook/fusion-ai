/**
 * Environment Drift Detection Component
 * Detect and alert on configuration drift across environments
 */
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { AlertCircle, CheckCircle2, GitBranch } from 'lucide-react';

export function EnvironmentDriftDetection() {
  const { data: environments = [] } = useQuery({
    queryKey: ['environment-states'],
    queryFn: async () => {
      const result = await base44.functions.invoke('detectEnvironmentDrift', {});
      return result?.environments || [];
    },
  });

  const driftItems = environments.filter(e => e.hasDrift);
  const healthyCount = environments.filter(e => !e.hasDrift).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          Environment Drift Detection
        </h3>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400">
          {healthyCount}/{environments.length} Synchronized
        </div>
      </div>

      <div className="space-y-2">
        {environments.map((env, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className={`p-4 ${
              env.hasDrift
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {env.hasDrift ? (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{env.name}</h4>
                    {env.hasDrift ? (
                      <div className="mt-2 space-y-1">
                        {env.driftItems?.map((item, i) => (
                          <p key={i} className="text-xs text-white/70">
                            • {item.key}: {item.expected} ≠ {item.actual}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-400/80 mt-1">
                        All configurations synchronized
                      </p>
                    )}
                  </div>
                </div>

                {env.hasDrift && (
                  <button className="text-xs px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-colors">
                    Fix
                  </button>
                )}
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}