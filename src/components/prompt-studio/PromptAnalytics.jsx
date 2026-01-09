/**
 * Prompt Analytics - Advanced performance tracking and analysis
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Zap, Clock, CheckCircle, 
  Filter, Calendar, Download 
} from 'lucide-react';

export function PromptAnalytics() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: logs = [] } = useQuery({
    queryKey: ['prompt-execution-logs'],
    queryFn: () => base44.entities.PromptExecutionLog?.list?.('-created_date', 1000) || []
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['prompt-templates'],
    queryFn: () => base44.entities.PromptTemplate?.list?.('-created_date', 100) || []
  });

  // Calculate metrics
  const metrics = templates.map(t => {
    const templateLogs = logs.filter(l => l.prompt_template_id === t.id);
    const successful = templateLogs.filter(l => l.status === 'success').length;
    const avgLatency = templateLogs.length > 0
      ? templateLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / templateLogs.length
      : 0;

    return {
      name: t.name,
      executions: templateLogs.length,
      successRate: templateLogs.length > 0 ? (successful / templateLogs.length * 100).toFixed(1) : 0,
      avgLatency: avgLatency.toFixed(0),
      category: t.category
    };
  }).filter(m => selectedCategory === 'all' || m.category === selectedCategory);

  // Time series data
  const timeSeriesData = Array.from({ length: 30 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - idx));
    const dayLogs = logs.filter(l => 
      new Date(l.created_date).toDateString() === date.toDateString()
    );

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      executions: dayLogs.length,
      avgLatency: dayLogs.length > 0
        ? (dayLogs.reduce((s, l) => s + (l.latency_ms || 0), 0) / dayLogs.length).toFixed(0)
        : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CinematicCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-3">
            <div className="flex-1">
              <label className="text-white/60 text-sm mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-white/60 text-sm mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-white/60 text-sm mb-2 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="all">All Categories</option>
              <option value="agent">Agent</option>
              <option value="api">API</option>
              <option value="workflow">Workflow</option>
              <option value="analysis">Analysis</option>
              <option value="generation">Generation</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button size="sm" className="bg-blue-600">
              <Filter className="w-4 h-4 mr-1" />
              Apply
            </Button>
            <Button size="sm" variant="outline" className="border-white/10">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CinematicCard>

      {/* Performance Chart */}
      <CinematicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Performance Trends
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="executions" 
              stroke="#06b6d4" 
              strokeWidth={2}
              name="Executions"
            />
            <Line 
              type="monotone" 
              dataKey="avgLatency" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Avg Latency (ms)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CinematicCard>

      {/* Template Metrics */}
      <CinematicCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-400" />
          Template Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#ffffff40" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#ffffff40" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
            <Bar dataKey="avgLatency" fill="#f59e0b" name="Avg Latency (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </CinematicCard>

      {/* Detailed Table */}
      <CinematicCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white/60">Template</th>
                <th className="text-left p-3 text-white/60">Executions</th>
                <th className="text-left p-3 text-white/60">Success Rate</th>
                <th className="text-left p-3 text-white/60">Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-white font-mono">{m.name.slice(0, 20)}</td>
                  <td className="p-3 text-white/80">{m.executions}</td>
                  <td className="p-3">
                    <span className={m.successRate > 90 ? 'text-green-400' : 'text-orange-400'}>
                      {m.successRate}%
                    </span>
                  </td>
                  <td className="p-3 text-white/80">{m.avgLatency}ms</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CinematicCard>
    </div>
  );
}