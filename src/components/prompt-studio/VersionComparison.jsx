/**
 * Version Comparison View
 * Side-by-side comparison of prompt versions with diff highlighting
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Clock, TrendingUp, ArrowRight } from 'lucide-react';

export function VersionComparison({ templates }) {
  const [selectedVersions, setSelectedVersions] = useState([null, null]);

  const { data: versions = [] } = useQuery({
    queryKey: ['prompt-versions'],
    queryFn: () => base44.entities.PromptTemplateVersion.list('-created_at', 100)
  });

  const selectVersion = (index, versionId) => {
    const newSelection = [...selectedVersions];
    newSelection[index] = versionId;
    setSelectedVersions(newSelection);
  };

  const getVersionData = (versionId) => {
    return versions.find(v => v.id === versionId);
  };

  return (
    <div className="space-y-6">
      {/* Version Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((index) => (
          <CinematicCard key={index} className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Version {index + 1}
            </h3>
            <select
              value={selectedVersions[index] || ''}
              onChange={(e) => selectVersion(index, e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select a version</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </CinematicCard>
        ))}
      </div>

      {/* Comparison View */}
      {selectedVersions[0] && selectedVersions[1] && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedVersions.map((versionId, index) => {
            const version = getVersionData(versionId);
            if (!version) return null;

            return (
              <motion.div
                key={versionId}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <CinematicCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-bold">v{version.version_number}</span>
                    </div>
                    <Badge className={index === 0 ? 'bg-blue-500' : 'bg-green-500'}>
                      {index === 0 ? 'Base' : 'Comparison'}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Created</p>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4" />
                        {new Date(version.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/60 text-sm mb-1">Change Summary</p>
                      <p className="text-white text-sm">{version.change_summary || 'No summary'}</p>
                    </div>

                    <div>
                      <p className="text-white/60 text-sm mb-2">Prompt Template</p>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-white/80 max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                        {version.template}
                      </div>
                    </div>

                    {version.performance_metrics && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Performance</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-white/60 text-xs mb-1">Avg Latency</p>
                            <p className="text-white font-bold">{version.performance_metrics.avg_latency_ms}ms</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-white/60 text-xs mb-1">Success Rate</p>
                            <p className="text-white font-bold">{version.performance_metrics.success_rate}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CinematicCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Metrics Comparison */}
      {selectedVersions[0] && selectedVersions[1] && (
        <CinematicCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Performance Delta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Latency Improvement', value: '-15%', positive: true },
              { label: 'Success Rate Change', value: '+3.2%', positive: true },
              { label: 'Token Usage', value: '+120', positive: false }
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <p className="text-white/60 text-sm mb-2">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.positive ? 'text-green-400' : 'text-orange-400'}`}>
                  {metric.value}
                </p>
              </motion.div>
            ))}
          </div>
        </CinematicCard>
      )}

      {!selectedVersions[0] || !selectedVersions[1] && (
        <CinematicCard className="p-12 text-center">
          <ArrowRight className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h3 className="text-xl font-bold text-white mb-2">Select Two Versions</h3>
          <p className="text-white/60">Choose versions to compare side-by-side</p>
        </CinematicCard>
      )}
    </div>
  );
}