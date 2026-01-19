/**
 * Funnel Visualization Widget — Track conversion paths
 * Displays multi-stage conversion funnel with drop-off analysis
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Filter, TrendingDown, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function FunnelVisualizationWidget({ testId }) {
  const [segmentBy, setSegmentBy] = useState('all');
  const [segmentValue, setSegmentValue] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: funnel, isLoading } = useQuery({
    queryKey: ['funnel-visualization', testId, segmentBy, segmentValue],
    queryFn: async () => {
      const result = await base44.functions.invoke('calculateFunnel', { 
        test_id: testId,
        segment_by: segmentBy !== 'all' ? segmentBy : undefined,
        segment_value: segmentValue !== 'all' ? segmentValue : undefined
      });
      return result.data?.funnel || [];
    },
    enabled: !!testId,
    staleTime: 2 * 60 * 1000,
  });

  const exportToCSV = () => {
    if (!funnel?.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Stage', 'Users', 'Conversion Rate', 'Drop-off Rate'];
    const rows = funnel.map((stage, idx) => {
      const conversionRate = idx === 0 ? 100 : (stage.users / funnel[0].users) * 100;
      const dropOffRate = idx > 0 ? ((funnel[idx - 1].users - stage.users) / funnel[idx - 1].users) * 100 : 0;
      return [stage.name, stage.users, `${conversionRate.toFixed(2)}%`, `${dropOffRate.toFixed(2)}%`];
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-analysis-${testId}-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Funnel data exported');
  };

  if (isLoading) {
    return (
      <CinematicCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-96 bg-white/10 rounded" />
        </div>
      </CinematicCard>
    );
  }

  const maxUsers = funnel?.[0]?.users || 1;

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Conversion Funnel</h3>
            <p className="text-sm text-white/60">Stage-by-stage user flow analysis</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline" 
            size="sm"
            className="border-white/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="border-white/20">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Segmentation Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">Segment By</label>
              <Select value={segmentBy} onValueChange={setSegmentBy}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="acquisition_channel">Acquisition Channel</SelectItem>
                  <SelectItem value="user_role">User Role</SelectItem>
                  <SelectItem value="device_type">Device Type</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {segmentBy !== 'all' && (
              <div>
                <label className="text-xs text-white/60 mb-2 block">Value</label>
                <Select value={segmentValue} onValueChange={setSegmentValue}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {segmentBy === 'acquisition_channel' && (
                      <>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </>
                    )}
                    {segmentBy === 'user_role' && (
                      <>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </>
                    )}
                    {segmentBy === 'device_type' && (
                      <>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {funnel?.map((stage, index) => {
          const widthPercent = (stage.users / maxUsers) * 100;
          const conversionRate = index === 0 ? 100 : (stage.users / funnel[0].users) * 100;
          const dropOffRate = index > 0 ? ((funnel[index - 1].users - stage.users) / funnel[index - 1].users) * 100 : 0;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{stage.name}</span>
                  {dropOffRate > 30 && index > 0 && (
                    <AlertCircle className="w-4 h-4 text-red-400" title={`High drop-off: ${dropOffRate.toFixed(1)}%`} />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">{stage.users.toLocaleString()} users</span>
                  <span className="text-xs font-semibold text-cyan-400">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative h-16 bg-white/5 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.15 + 0.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className={`h-full rounded-lg ${
                    conversionRate >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    conversionRate >= 50 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                    conversionRate >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                    'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm font-bold text-white">{stage.users.toLocaleString()}</span>
                  </div>
                </motion.div>
              </div>

              {/* Drop-off Indicator */}
              {index > 0 && dropOffRate > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                  className="absolute -top-1 right-0 flex items-center gap-1 text-xs text-red-400"
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>{dropOffRate.toFixed(1)}% drop</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall Conversion */}
      {funnel && funnel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: funnel.length * 0.15 + 0.3 }}
          className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Overall Conversion Rate</span>
            <span className="text-xl font-bold text-cyan-400">
              {((funnel[funnel.length - 1].users / funnel[0].users) * 100).toFixed(2)}%
            </span>
          </div>
        </motion.div>
      )}
    </CinematicCard>
  );
}