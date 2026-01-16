import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, Zap, DollarSign, CheckCircle2, 
  AlertCircle, Clock, Bell, HelpCircle
} from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { MonitoringOnboarding } from '../onboarding/MonitoringOnboarding';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RealtimeMonitoring() {
  const [showHelp, setShowHelp] = useState(false);
  const [filter, setFilter] = useState({ environment: 'all', timeRange: '1h' });
  const [liveMetrics, setLiveMetrics] = useState({
    currentRPS: 0,
    avgLatency: 0,
    successRate: 100,
    totalCost: 0,
    activeAlerts: 0
  });



  const { data: recentExecutions = [] } = useQuery({
    queryKey: ['recent-executions', filter],
    queryFn: () => base44.entities.PromptExecutionLog.list('-created_date', 100),
    refetchInterval: 5000
  });

  // Calculate real metrics from actual data
  useEffect(() => {
    if (recentExecutions.length > 0) {
      const last5 = recentExecutions.slice(0, 5);
      setLiveMetrics({
        currentRPS: last5.length,
        avgLatency: Math.floor(last5.reduce((sum, e) => sum + (e.latency_ms || 0), 0) / last5.length),
        successRate: (last5.filter(e => e.status === 'success').length / last5.length) * 100,
        totalCost: recentExecutions.reduce((sum, e) => sum + (e.cost_usd || 0), 0),
        activeAlerts: recentExecutions.filter(e => e.status === 'failed').length
      });
    }
  }, [recentExecutions]);

  // Calculate metrics
  const timeSeriesData = recentExecutions.slice(0, 20).reverse().map((exec, idx) => ({
    time: idx,
    latency: exec.latency_ms || 0,
    cost: (exec.cost_usd || 0) * 1000,
    tokens: exec.tokens?.total || 0
  }));

  const MetricCard = ({ icon: Icon, label, value, trend, color, unit }) => (
    <CinematicCard className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <Badge className={`${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </Badge>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toFixed(unit === '$' ? 4 : 0) : value}
        {unit && <span className="text-lg text-white/60 ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-white/60">{label}</div>
    </CinematicCard>
  );

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Real-Time Monitoring</h2>
              <p className="text-white/60 text-sm">Live performance metrics and alerts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowHelp(true)} variant="outline" size="sm" className="border-white/10">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Select value={filter.environment} onValueChange={(v) => setFilter({ ...filter, environment: v })}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.timeRange} onValueChange={(v) => setFilter({ ...filter, timeRange: v })}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="5m">Last 5 min</SelectItem>
                <SelectItem value="1h">Last 1 hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CinematicCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Zap}
          label="Requests/sec"
          value={liveMetrics.currentRPS}
          color="from-blue-500 to-cyan-500"
        />
        <MetricCard
          icon={Clock}
          label="Avg Latency"
          value={liveMetrics.avgLatency}
          unit="ms"
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Success Rate"
          value={liveMetrics.successRate}
          unit="%"
          color="from-green-500 to-emerald-500"
          trend={0.5}
        />
        <MetricCard
          icon={DollarSign}
          label="Total Cost"
          value={liveMetrics.totalCost}
          unit="$"
          color="from-orange-500 to-amber-500"
        />
        <MetricCard
          icon={Bell}
          label="Active Alerts"
          value={liveMetrics.activeAlerts}
          color={liveMetrics.activeAlerts > 0 ? 'from-red-500 to-rose-600' : 'from-slate-500 to-slate-600'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Latency Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="latency" stroke="#8b5cf6" fillOpacity={1} fill="url(#latencyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </CinematicCard>

        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Token Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CinematicCard>
      </div>

      {/* Recent Activity */}
      <CinematicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        {recentExecutions.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Execute prompts to see real-time monitoring</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {recentExecutions.slice(0, 15).map((exec) => (
            <div 
              key={exec.id}
              className="p-3 rounded-lg bg-slate-800/30 border border-white/10 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {exec.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <div className="text-white text-sm font-medium">
                    {exec.prompt_template_id || exec.execution_type || 'Unknown'}
                  </div>
                  <div className="text-white/60 text-xs">
                    {new Date(exec.created_date).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="text-white/60 text-xs">Latency</div>
                  <div className="text-white font-semibold">{exec.latency_ms}ms</div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">Cost</div>
                  <div className="text-white font-semibold">${exec.cost_usd?.toFixed(4)}</div>
                </div>
                {exec.tokens?.total && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {exec.tokens.total} tokens
                  </Badge>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </CinematicCard>

      {/* Onboarding */}
      {showHelp && (
        <MonitoringOnboarding
          onComplete={() => setShowHelp(false)}
          onDismiss={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}