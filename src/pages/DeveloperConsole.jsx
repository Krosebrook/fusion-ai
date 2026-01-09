/**
 * Developer Console
 * Aggregates logs, metrics, and performance data from all pipelines
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/hooks/useAuth';
import { motion } from 'framer-motion';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Terminal, Activity, AlertCircle, CheckCircle, Clock, 
  TrendingUp, Download, RefreshCw, Search, Zap
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeveloperConsolePage() {
  const { user } = useAuth();
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch pipeline runs with logs
  const { data: pipelineRuns = [], refetch } = useQuery({
    queryKey: ['pipeline-runs', timeRange],
    queryFn: async () => {
      const runs = await base44.entities.PipelineRun.list('-created_date', 50);
      return runs;
    },
    refetchInterval: 10000
  });

  // Fetch security scans
  const { data: securityScans = [] } = useQuery({
    queryKey: ['security-scans'],
    queryFn: () => base44.entities.SecurityScan.list('-started_at', 20)
  });

  // Fetch audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 100)
  });

  // Calculate metrics
  const metrics = {
    totalRuns: pipelineRuns.length,
    successRate: pipelineRuns.length > 0 
      ? ((pipelineRuns.filter(r => r.status === 'success').length / pipelineRuns.length) * 100).toFixed(1)
      : 0,
    avgDuration: pipelineRuns.length > 0
      ? Math.round(pipelineRuns.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / pipelineRuns.length)
      : 0,
    activeRuns: pipelineRuns.filter(p => p.status === 'running').length,
    failureRate: pipelineRuns.length > 0
      ? ((pipelineRuns.filter(r => r.status === 'failed').length / pipelineRuns.length) * 100).toFixed(1)
      : 0,
    securityIssues: securityScans.reduce((sum, s) => sum + (s.severity_summary?.critical || 0) + (s.severity_summary?.high || 0), 0)
  };

  // Performance trend data
  const performanceData = pipelineRuns.slice(0, 20).reverse().map((run, idx) => ({
    name: `#${run.run_number || idx + 1}`,
    duration: run.duration_seconds || 0,
    success: run.status === 'success' ? 1 : 0
  }));

  // Filtered logs
  const filteredLogs = auditLogs
    .filter(log => logFilter === 'all' || log.action.includes(logFilter))
    .filter(log => searchTerm === '' || JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExportLogs = () => {
    const logsText = filteredLogs.map(log => 
      `[${new Date(log.timestamp).toISOString()}] ${log.action} - ${log.entity_type} - ${JSON.stringify(log.details)}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Terminal className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Developer Console</h1>
              <p className="text-white/60">Real-time monitoring, logs, and performance insights</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => refetch()} variant="outline" className="border-white/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportLogs} className="bg-gradient-to-r from-cyan-600 to-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Runs', value: metrics.totalRuns, icon: Activity, color: 'from-blue-500 to-cyan-500' },
            { label: 'Success Rate', value: `${metrics.successRate}%`, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: 'Avg Duration', value: `${metrics.avgDuration}s`, icon: Clock, color: 'from-orange-500 to-amber-500' },
            { label: 'Active Runs', value: metrics.activeRuns, icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Failure Rate', value: `${metrics.failureRate}%`, icon: AlertCircle, color: 'from-red-500 to-rose-500' },
            { label: 'Security Issues', value: metrics.securityIssues, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' }
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CinematicCard className="p-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/60 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </CinematicCard>
            </motion.div>
          ))}
        </div>

        {/* Performance Chart */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Pipeline Performance Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="duration" stroke="#06b6d4" fillOpacity={1} fill="url(#durationGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </CinematicCard>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-6">
            <CinematicCard className="p-6">
              {/* Log Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40"
                  />
                </div>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="all">All Events</option>
                  <option value="pipeline">Pipeline Events</option>
                  <option value="deployment">Deployment Events</option>
                  <option value="security">Security Events</option>
                  <option value="secret">Secret Events</option>
                </select>
              </div>

              {/* Logs Display */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-mono text-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-white/40 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-cyan-400 font-semibold">{log.action}</span>
                      <span className="text-white/60">→</span>
                      <span className="text-white/80">{log.entity_type}</span>
                      {log.details && (
                        <details className="flex-1">
                          <summary className="text-purple-400 cursor-pointer text-xs">Details</summary>
                          <pre className="mt-2 text-xs text-white/60 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CinematicCard>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <CinematicCard className="p-6">
              <div className="space-y-4">
                {securityScans.map((scan) => (
                  <div key={scan.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{scan.scan_type.toUpperCase()} Scan</p>
                          <p className="text-white/60 text-sm">{new Date(scan.started_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className={scan.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {scan.status}
                      </Badge>
                    </div>
                    {scan.severity_summary && (
                      <div className="flex gap-4 text-sm">
                        <span className="text-red-400">🔴 {scan.severity_summary.critical} Critical</span>
                        <span className="text-orange-400">🟠 {scan.severity_summary.high} High</span>
                        <span className="text-yellow-400">🟡 {scan.severity_summary.medium} Medium</span>
                        <span className="text-blue-400">🔵 {scan.severity_summary.low} Low</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CinematicCard>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <CinematicCard className="p-6">
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
                    <div className="flex items-center gap-3 text-white/80">
                      <span className="text-white/40">{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">{log.action}</span>
                      <span>by</span>
                      <span className="text-cyan-400">{log.created_by}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CinematicCard>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CinematicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Pipeline Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { status: 'Success', count: pipelineRuns.filter(r => r.status === 'success').length },
                    { status: 'Failed', count: pipelineRuns.filter(r => r.status === 'failed').length },
                    { status: 'Running', count: pipelineRuns.filter(r => r.status === 'running').length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="status" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CinematicCard>

              <CinematicCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Pipeline Runs</h3>
                <div className="space-y-2">
                  {pipelineRuns.slice(0, 5).map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white font-medium">Run #{run.run_number}</p>
                        <p className="text-white/60 text-sm">{run.branch}</p>
                      </div>
                      <Badge className={
                        run.status === 'success' ? 'bg-green-500' :
                        run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }>
                        {run.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CinematicCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}