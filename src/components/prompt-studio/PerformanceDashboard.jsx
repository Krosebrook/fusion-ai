import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Clock, DollarSign, 
  CheckCircle2, AlertCircle, BarChart3 
} from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';

export function PerformanceDashboard({ templateId, timeRange = '7d' }) {
  const { data: executions = [] } = useQuery({
    queryKey: ['prompt-executions', templateId, timeRange],
    queryFn: () => base44.entities.PromptExecutionLog.filter(
      templateId ? { prompt_template_id: templateId } : {},
      '-created_date',
      1000
    ),
    enabled: true
  });

  // Calculate metrics
  const metrics = {
    totalExecutions: executions.length,
    successRate: executions.length > 0 
      ? (executions.filter(e => e.status === 'success').length / executions.length * 100).toFixed(1)
      : 0,
    avgLatency: executions.length > 0
      ? (executions.reduce((acc, e) => acc + (e.latency_ms || 0), 0) / executions.length).toFixed(0)
      : 0,
    totalCost: executions.reduce((acc, e) => acc + (e.cost_usd || 0), 0).toFixed(4),
    avgQuality: executions.filter(e => e.quality_scores?.auto_score).length > 0
      ? (executions
          .filter(e => e.quality_scores?.auto_score)
          .reduce((acc, e) => acc + e.quality_scores.auto_score, 0) / 
          executions.filter(e => e.quality_scores?.auto_score).length
        ).toFixed(1)
      : null
  };

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = "purple" }) => (
    <CinematicCard className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="text-xs font-semibold">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </CinematicCard>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Executions"
          value={metrics.totalExecutions.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Success Rate"
          value={`${metrics.successRate}%`}
          trend={parseFloat(metrics.successRate) > 95 ? 'up' : 'down'}
          trendValue={`${metrics.successRate}%`}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Avg Latency"
          value={`${metrics.avgLatency}ms`}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${metrics.totalCost}`}
          color="orange"
        />
      </div>

      {/* Quality Score */}
      {metrics.avgQuality && (
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quality Score</h3>
            <Badge className={`${
              parseFloat(metrics.avgQuality) >= 8 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : parseFloat(metrics.avgQuality) >= 6
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {metrics.avgQuality} / 10
            </Badge>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${metrics.avgQuality * 10}%` }}
            />
          </div>
        </CinematicCard>
      )}

      {/* Recent Executions */}
      <CinematicCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Executions</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {executions.slice(0, 20).map((exec) => (
            <div 
              key={exec.id}
              className="p-3 rounded-lg bg-slate-800/30 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {exec.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <div className="text-white text-sm font-medium">
                    {exec.execution_type || 'Single'} Execution
                  </div>
                  <div className="text-white/60 text-xs">
                    {new Date(exec.created_date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/60 text-xs">Latency</div>
                  <div className="text-white text-sm font-semibold">{exec.latency_ms}ms</div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">Cost</div>
                  <div className="text-white text-sm font-semibold">${exec.cost_usd?.toFixed(4)}</div>
                </div>
                {exec.quality_scores?.auto_score && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Q: {exec.quality_scores.auto_score}/10
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CinematicCard>
    </div>
  );
}