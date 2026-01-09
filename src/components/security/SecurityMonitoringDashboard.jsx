/**
 * Real-Time Security Monitoring Dashboard
 * Displays security events, vulnerability scans, and incident alerts
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, 
  RefreshCw, Bell, Key, Code, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-500', icon: XCircle, label: 'Critical' },
  high: { color: 'bg-orange-500', icon: AlertTriangle, label: 'High' },
  medium: { color: 'bg-yellow-500', icon: Clock, label: 'Medium' },
  low: { color: 'bg-blue-500', icon: CheckCircle, label: 'Low' }
};

export function SecurityMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const queryClient = useQueryClient();

  // Fetch recent security events
  const { data: securityEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events', timeRange],
    queryFn: async () => {
      const startTime = new Date();
      if (timeRange === '24h') startTime.setHours(startTime.getHours() - 24);
      else if (timeRange === '7d') startTime.setDate(startTime.getDate() - 7);
      else if (timeRange === '30d') startTime.setDate(startTime.getDate() - 30);
      
      return await base44.entities.Event.filter({
        type: 'security_incident',
        timestamp: { $gte: startTime.toISOString() }
      });
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent security scans
  const { data: securityScans = [], isLoading: scansLoading } = useQuery({
    queryKey: ['security-scans'],
    queryFn: () => base44.entities.SecurityScan.list('-started_at', 10)
  });

  // Rotate secrets mutation
  const rotateSecretMutation = useMutation({
    mutationFn: async ({ secretName, provider }) => {
      const response = await base44.functions.invoke('rotateSecrets', { secretName, provider });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    }
  });

  // Run SAST scan mutation
  const runSastScanMutation = useMutation({
    mutationFn: async (scanConfig) => {
      const response = await base44.functions.invoke('sastScan', scanConfig);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-scans'] });
    }
  });

  // Calculate security metrics
  const metrics = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    openIncidents: securityEvents.filter(e => e.status === 'open').length,
    resolvedIncidents: securityEvents.filter(e => e.status === 'resolved').length,
    avgResponseTime: securityEvents
      .filter(e => e.metadata?.resolvedAt && e.timestamp)
      .reduce((acc, e) => {
        const responseTime = new Date(e.metadata.resolvedAt).getTime() - new Date(e.timestamp).getTime();
        return acc + responseTime / (1000 * 60); // minutes
      }, 0) / Math.max(1, securityEvents.filter(e => e.metadata?.resolvedAt).length)
  };

  // Prepare trend data
  const trendData = React.useMemo(() => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const interval = timeRange === '24h' ? 'hour' : 'day';
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (interval === 'hour') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      const periodEvents = securityEvents.filter(e => {
        const eventDate = new Date(e.timestamp);
        if (interval === 'hour') {
          return eventDate.getHours() === date.getHours() && 
                 eventDate.getDate() === date.getDate();
        } else {
          return eventDate.getDate() === date.getDate();
        }
      });

      data.push({
        time: interval === 'hour' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        events: periodEvents.length,
        critical: periodEvents.filter(e => e.severity === 'critical').length,
        high: periodEvents.filter(e => e.severity === 'high').length
      });
    }

    return data;
  }, [securityEvents, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Security Monitoring</h1>
              <p className="text-white/60">Real-time threat detection and incident response</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['security-events'] });
                queryClient.invalidateQueries({ queryKey: ['security-scans'] });
              }}
              className="bg-white/10 hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white mt-1">{metrics.totalEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CinematicCard>

          <CinematicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Critical Incidents</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{metrics.criticalEvents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CinematicCard>

          <CinematicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Open Incidents</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{metrics.openIncidents}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-400" />
            </div>
          </CinematicCard>

          <CinematicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Avg Response Time</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{Math.round(metrics.avgResponseTime)}m</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </CinematicCard>
        </div>

        {/* Trend Chart */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Security Events Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="events" stroke="#3b82f6" fillOpacity={1} fill="url(#eventGradient)" />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#criticalGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </CinematicCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Security Events */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Security Events</h2>
              <Bell className="w-5 h-5 text-white/60" />
            </div>

            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event) => {
                const config = SEVERITY_CONFIG[event.severity];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">{event.description}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={config.color}>{config.label}</Badge>
                  </motion.div>
                );
              })}

              {securityEvents.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>No security events in selected timeframe</p>
                </div>
              )}
            </div>
          </CinematicCard>

          {/* Recent SAST Scans */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent SAST Scans</h2>
              <Code className="w-5 h-5 text-white/60" />
            </div>

            <div className="space-y-3">
              {securityScans.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{scan.target_type} Scan</p>
                    <Badge className={scan.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {scan.status}
                    </Badge>
                  </div>

                  {scan.severity_summary && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-400">{scan.severity_summary.critical} Critical</span>
                      <span className="text-orange-400">{scan.severity_summary.high} High</span>
                      <span className="text-yellow-400">{scan.severity_summary.medium} Medium</span>
                      <span className="text-blue-400">{scan.severity_summary.low} Low</span>
                    </div>
                  )}

                  <p className="text-white/40 text-xs mt-2">
                    {new Date(scan.started_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}

              <Button
                onClick={() => runSastScanMutation.mutate({ targetType: 'codebase', targetId: 'main' })}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={runSastScanMutation.isPending}
              >
                {runSastScanMutation.isPending ? 'Scanning...' : 'Run New SAST Scan'}
              </Button>
            </div>
          </CinematicCard>
        </div>

        {/* Secrets Rotation Section */}
        <CinematicCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Dynamic Secrets Rotation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'REPLICATE_API_KEY', 'VERCEL_TOKEN', 'SUPABASE_SERVICE_ROLE_KEY'].map((secretName) => (
              <div key={secretName} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white font-medium mb-2">{secretName}</p>
                <Button
                  onClick={() => rotateSecretMutation.mutate({ 
                    secretName, 
                    provider: secretName.split('_')[0].toLowerCase()
                  })}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  disabled={rotateSecretMutation.isPending}
                  size="sm"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  {rotateSecretMutation.isPending ? 'Rotating...' : 'Rotate'}
                </Button>
              </div>
            ))}
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}

export default SecurityMonitoringDashboard;