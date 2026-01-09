/**
 * Personalized Developer Dashboard
 * Shows active pipelines, recent runs, and assigned tasks for each developer
 */

import { useAuth } from '@/components/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  GitBranch, Clock, CheckCircle, XCircle, Zap, 
  Calendar, TrendingUp, Award, Target, Rocket, Terminal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeveloperDashboardPage() {
  const { user } = useAuth();

  // Fetch user's pipelines (created by them)
  const { data: myPipelines = [] } = useQuery({
    queryKey: ['my-pipelines', user?.email],
    queryFn: () => base44.entities.PipelineConfig.filter({ created_by: user?.email }),
    enabled: !!user
  });

  // Fetch user's recent runs
  const { data: myRuns = [] } = useQuery({
    queryKey: ['my-runs', user?.email],
    queryFn: async () => {
      const runs = await base44.entities.PipelineRun.filter(
        { triggered_by: user?.email },
        '-created_date',
        20
      );
      return runs;
    },
    enabled: !!user
  });

  // Fetch assigned tasks
  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: () => base44.entities.AgentTask.filter({ 
      assigned_agent_id: user?.id,
      status: { $in: ['pending', 'in_progress'] }
    }),
    enabled: !!user
  });

  // Calculate personal metrics
  const metrics = {
    activePipelines: myPipelines.filter(p => p.active).length,
    totalRuns: myRuns.length,
    successRate: myRuns.length > 0
      ? ((myRuns.filter(r => r.status === 'success').length / myRuns.length) * 100).toFixed(1)
      : 0,
    avgDuration: myRuns.length > 0
      ? Math.round(myRuns.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / myRuns.length)
      : 0,
    pendingTasks: myTasks.length,
    completedToday: myRuns.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.created_date).toDateString() === today;
    }).length
  };

  // Activity trend data
  const activityData = myRuns.slice(0, 14).reverse().map((run, idx) => ({
    day: new Date(run.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    runs: 1,
    success: run.status === 'success' ? 1 : 0
  })).reduce((acc, curr) => {
    const existing = acc.find(item => item.day === curr.day);
    if (existing) {
      existing.runs += 1;
      existing.success += curr.success;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Rocket className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Developer'}! 👋
              </h1>
              <p className="text-white/60 text-lg">Here's your personalized development overview</p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Active Pipelines', value: metrics.activePipelines, icon: GitBranch, color: 'from-purple-500 to-pink-500' },
            { label: 'Total Runs', value: metrics.totalRuns, icon: Zap, color: 'from-blue-500 to-cyan-500' },
            { label: 'Success Rate', value: `${metrics.successRate}%`, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: 'Avg Duration', value: `${metrics.avgDuration}s`, icon: Clock, color: 'from-orange-500 to-amber-500' },
            { label: 'Pending Tasks', value: metrics.pendingTasks, icon: Target, color: 'from-red-500 to-rose-500' },
            { label: 'Runs Today', value: metrics.completedToday, icon: Calendar, color: 'from-indigo-500 to-purple-500' }
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CinematicCard className="p-5">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/60 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </CinematicCard>
            </motion.div>
          ))}
        </div>

        {/* Activity Trend */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Your Activity Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="runs" stroke="#06b6d4" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CinematicCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pipeline Runs */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Recent Runs</h2>
              <Link to={createPageUrl('CICDAutomation')}>
                <Button size="sm" variant="ghost" className="text-cyan-400">
                  View All →
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {myRuns.slice(0, 5).map((run) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{run.branch}</span>
                    </div>
                    <Badge className={
                      run.status === 'success' ? 'bg-green-500' :
                      run.status === 'failed' ? 'bg-red-500' :
                      run.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                    }>
                      {run.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span>{new Date(run.created_date).toLocaleString()}</span>
                    {run.duration_seconds && (
                      <>
                        <span>•</span>
                        <span>{run.duration_seconds}s</span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              {myRuns.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <Terminal className="w-12 h-12 mx-auto mb-3" />
                  <p>No pipeline runs yet</p>
                </div>
              )}
            </div>
          </CinematicCard>

          {/* Assigned Tasks */}
          <CinematicCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Tasks</h2>
              <Link to={createPageUrl('AgentOrchestration')}>
                <Button size="sm" variant="ghost" className="text-cyan-400">
                  View All →
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {myTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-white/60 text-sm mt-1">{task.description}</p>
                    </div>
                    <Badge className={
                      task.priority === 'critical' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(task.created_date).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}

              {myTasks.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <Award className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>All caught up! No pending tasks</p>
                </div>
              )}
            </div>
          </CinematicCard>
        </div>

        {/* Quick Actions */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={createPageUrl('CICDAutomation')}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <GitBranch className="w-4 h-4 mr-2" />
                View Pipelines
              </Button>
            </Link>
            <Link to={createPageUrl('DeveloperConsole')}>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <Terminal className="w-4 h-4 mr-2" />
                Open Console
              </Button>
            </Link>
            <Link to={createPageUrl('SecurityMonitoring')}>
              <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                <XCircle className="w-4 h-4 mr-2" />
                Security Monitor
              </Button>
            </Link>
            <Link to={createPageUrl('Analytics')}>
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}