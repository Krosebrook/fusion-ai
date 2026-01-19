/**
 * Cohort Analysis Widget — Track user segments over time
 * Displays retention curves and engagement patterns by cohort
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Calendar, TrendingUp, Download, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUserPermissions } from '@/components/hooks/useUserPermissions';

export function CohortAnalysisWidget({ testId }) {
  const [timeframe, setTimeframe] = useState('week');
  const [segmentBy, setSegmentBy] = useState('all');
  const [segmentValue, setSegmentValue] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { hasPermission } = useUserPermissions();

  const { data: cohorts = [], isLoading } = useQuery({
    queryKey: ['cohort-analysis', testId, timeframe, segmentBy, segmentValue],
    queryFn: async () => {
      const result = await base44.functions.invoke('analyzeCohorts', { 
        test_id: testId,
        timeframe,
        segment_by: segmentBy !== 'all' ? segmentBy : undefined,
        segment_value: segmentValue !== 'all' ? segmentValue : undefined
      });
      return result.data?.cohorts || [];
    },
    enabled: !!testId,
    staleTime: 2 * 60 * 1000,
  });

  const exportToCSV = () => {
    if (!cohorts.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Period', 'Users', 'Retention Rate'];
    const rows = cohorts.map(c => [c.period, c.user_count, `${c.retention_rate}%`]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-analysis-${testId}-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Cohort data exported');
  };

  if (isLoading) {
    return (
      <CinematicCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-64 bg-white/10 rounded" />
        </div>
      </CinematicCard>
    );
  }

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cohort Analysis</h3>
            <p className="text-sm text-white/60">User retention by signup period</p>
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
          {hasPermission('analytics_export') && (
            <Button onClick={exportToCSV} variant="outline" size="sm" className="border-white/20">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          )}
          {['day', 'week', 'month'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/60 hover:text-white/80 border border-white/10'
              }`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
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

      {/* Cohort Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/60">Total Cohorts</span>
          </div>
          <p className="text-2xl font-bold text-white">{cohorts.length}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/60">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {cohorts.reduce((sum, c) => sum + c.user_count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Avg Retention</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {cohorts.length > 0
              ? Math.round(cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / cohorts.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Retention Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={cohorts}>
          <defs>
            <linearGradient id="cohortGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="period" 
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px'
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="retention_rate"
            name="Retention Rate"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#cohortGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Cohort List */}
      <div className="mt-6 space-y-2">
        {cohorts.slice(0, 5).map((cohort, index) => (
          <motion.div
            key={cohort.period}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <Badge className="bg-cyan-500/20 text-cyan-300">{cohort.period}</Badge>
              <span className="text-sm text-white">{cohort.user_count} users</span>
            </div>
            <span className={`text-sm font-semibold ${
              cohort.retention_rate >= 60 ? 'text-green-400' :
              cohort.retention_rate >= 30 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {cohort.retention_rate}% retained
            </span>
          </motion.div>
        ))}
      </div>
    </CinematicCard>
  );
}