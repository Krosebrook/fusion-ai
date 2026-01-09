import { motion } from "framer-motion";
import { Server, Clock, Shield, ExternalLink, Activity, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnvironmentCard({ environment, onSelect, delay = 0 }) {
  const typeColors = {
    development: { bg: '#00B4D8', light: 'rgba(0, 180, 216, 0.1)' },
    staging: { bg: '#F59E0B', light: 'rgba(245, 158, 11, 0.1)' },
    production: { bg: '#10B981', light: 'rgba(16, 185, 129, 0.1)' },
    custom: { bg: '#8B5CF6', light: 'rgba(139, 92, 246, 0.1)' }
  };

  const colors = typeColors[environment.type] || typeColors.custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer"
      style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                 style={{ background: colors.light }}>
              <Server className="w-5 h-5" style={{ color: colors.bg }} />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                {environment.name}
                {environment.protection_enabled && (
                  <Shield className="w-4 h-4 text-orange-400" />
                )}
              </h3>
              <p className="text-xs text-gray-400 capitalize">{environment.type}</p>
            </div>
          </div>
          <span className="px-2 py-1 rounded text-xs font-medium capitalize"
                style={{ background: colors.light, color: colors.bg }}>
            {environment.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Success Rate</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${environment.successRate}%`,
                  background: environment.successRate >= 80 ? '#10B981' : 
                             environment.successRate >= 50 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
            <span className="text-sm text-white">{environment.successRate}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Deployments</span>
          <span className="text-sm text-white">{environment.totalDeployments}</span>
        </div>

        {environment.activeRuns > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-400">
            <Activity className="w-4 h-4 animate-pulse" />
            {environment.activeRuns} deployment(s) running
          </div>
        )}

        {environment.lastDeployment && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            Last: {new Date(environment.lastDeployment).toLocaleString()}
          </div>
        )}

        {environment.deployment_url && (
          <a 
            href={environment.deployment_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {environment.deployment_url}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 text-gray-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>
    </motion.div>
  );
}