/**
 * Prompt Analytics
 * Performance metrics and effectiveness analysis
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Clock, Zap, 
  Target, DollarSign, BarChart3, Activity
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#FF7B00', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'];

export function PromptAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load execution logs
      const logs = await base44.entities.PromptExecutionLog.list('-created_date', 100);
      
      // Load templates
      const templates = await base44.entities.PromptTemplate.list();
      
      // Calculate metrics
      const metrics = calculateMetrics(logs, templates);
      setAnalytics(metrics);
    } catch (error) {
      console.error('Analytics load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (logs, templates) => {
    const successLogs = logs.filter(l => l.status === 'success');
    const avgLatency = successLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / successLogs.length || 0;
    const avgCost = successLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0) / successLogs.length || 0;
    const successRate = (successLogs.length / logs.length) * 100 || 0;
    
    // Usage by template
    const usageByTemplate = templates.map(t => ({
      name: t.name,
      count: t.usage_count || 0,
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    
    // Performance over time (last 7 days)
    const now = new Date();
    const performanceData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayLogs = logs.filter(l => {
        const logDate = new Date(l.created_date);
        return logDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        executions: dayLogs.length,
        avgLatency: dayLogs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / dayLogs.length || 0,
      };
    });
    
    // Category distribution
    const categoryDist = templates.reduce((acc, t) => {
      const cat = t.category || 'custom';
      acc[cat] = (acc[cat] || 0) + (t.usage_count || 0);
      return acc;
    }, {});
    
    const categoryData = Object.entries(categoryDist).map(([name, value]) => ({
      name,
      value,
    }));
    
    return {
      totalExecutions: logs.length,
      successRate,
      avgLatency,
      avgCost,
      totalCost: logs.reduce((acc, l) => acc + (l.cost_usd || 0), 0),
      usageByTemplate,
      performanceData,
      categoryData,
      topPerformers: templates
        .filter(t => t.avg_latency_ms && t.success_rate)
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, 5),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <BarChart3 className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <CinematicCard className="p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h3 className="text-xl font-semibold text-white mb-2">No analytics data</h3>
        <p className="text-slate-400">Start using prompts to see analytics</p>
      </CinematicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Executions"
          value={analytics.totalExecutions.toLocaleString()}
          icon={Zap}
          color="orange"
        />
        <MetricCard
          title="Success Rate"
          value={`${analytics.successRate.toFixed(1)}%`}
          icon={Target}
          color="green"
          trend={analytics.successRate > 90 ? 'up' : 'down'}
        />
        <MetricCard
          title="Avg Latency"
          value={`${analytics.avgLatency.toFixed(0)}ms`}
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Total Cost"
          value={`$${analytics.totalCost.toFixed(2)}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="executions"
                  stroke="#FF7B00"
                  strokeWidth={2}
                  dot={{ fill: '#FF7B00', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CinematicCard>

        {/* Category Distribution */}
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Usage by Category
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CinematicCard>
      </div>

      {/* Usage by Template */}
      <CinematicCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Most Used Templates
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.usageByTemplate}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#FF7B00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CinematicCard>

      {/* Top Performers */}
      {analytics.topPerformers && analytics.topPerformers.length > 0 && (
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Performing Templates
            </h3>
            <div className="space-y-3">
              {analytics.topPerformers.map((template, index) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{template.name}</p>
                      <p className="text-slate-400 text-sm">
                        {template.usage_count || 0} uses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {template.success_rate?.toFixed(1)}%
                      </p>
                      <p className="text-slate-400 text-xs">success</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {template.avg_latency_ms?.toFixed(0)}ms
                      </p>
                      <p className="text-slate-400 text-xs">latency</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CinematicCard>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    orange: 'from-orange-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <CinematicCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-400 text-sm">{title}</p>
      </CinematicCard>
    </motion.div>
  );
}

export default PromptAnalytics;