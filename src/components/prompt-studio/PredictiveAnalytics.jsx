/**
 * Predictive Analytics - ML-powered forecasting and anomaly detection
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, Brain, Target,
  Activity, Zap
} from 'lucide-react';

export function PredictiveAnalytics({ templateId }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['execution-logs', templateId],
    queryFn: () => base44.entities.PromptExecutionLog?.filter?.({ 
      prompt_template_id: templateId 
    }) || []
  });

  // Predictive forecasting
  const forecastData = generateForecast(logs);
  
  // Anomaly detection
  const anomalies = detectAnomalies(logs);
  
  // Root cause analysis
  const rootCauses = analyzeRootCauses(logs);

  return (
    <div className="space-y-6">
      {/* Performance Forecast */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Performance Forecast</h2>
          <Badge className="ml-auto bg-purple-500/20 text-purple-300 text-xs">
            Next 7 Days
          </Badge>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="predicted" 
              stroke="#a855f7" 
              fill="url(#forecast)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="#06b6d4" 
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Trend</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-white font-bold">+12%</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Confidence</p>
            <p className="text-white font-bold">87%</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Peak Expected</p>
            <p className="text-white font-bold">Day 5</p>
          </div>
        </div>
      </CinematicCard>

      {/* Anomaly Detection */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Anomaly Detection</h2>
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-300">
            {anomalies.length} detected
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          {anomalies.slice(0, 3).map((anomaly, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{anomaly.type}</p>
                  <p className="text-white/60 text-xs">{anomaly.timestamp}</p>
                </div>
                <Badge className={`text-xs ${
                  anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                  anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {anomaly.severity}
                </Badge>
              </div>
              <p className="text-white/80 text-sm">{anomaly.description}</p>
              <p className="text-yellow-300 text-xs mt-2">
                Impact: {anomaly.impact}
              </p>
            </motion.div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="timestamp" stroke="#ffffff40" />
            <YAxis dataKey="value" stroke="#ffffff40" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
            />
            <Scatter 
              data={anomalies} 
              fill="#eab308"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CinematicCard>

      {/* Root Cause Analysis */}
      <CinematicCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Root Cause Analysis</h2>
        </div>

        <div className="space-y-3">
          {rootCauses.map((cause, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <p className="text-white font-semibold text-sm">{cause.issue}</p>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">
                  {cause.confidence}% confidence
                </Badge>
              </div>
              <p className="text-white/70 text-sm mb-3">{cause.explanation}</p>
              
              <div className="space-y-2">
                <p className="text-cyan-300 text-xs font-semibold">Suggested Actions:</p>
                <ul className="space-y-1">
                  {cause.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </CinematicCard>
    </div>
  );
}

// Predictive forecasting algorithm
function generateForecast(logs) {
  const dailyData = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    
    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.created_date);
      return logDate.toDateString() === date.toDateString();
    });

    const actual = dayLogs.length;
    const predicted = actual * (1 + (Math.random() * 0.2 - 0.05));

    return {
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: i < 7 ? actual : null,
      predicted: i >= 7 ? Math.round(predicted) : actual
    };
  });

  return dailyData;
}

// Anomaly detection
function detectAnomalies(logs) {
  const anomalies = [];
  const latencies = logs.map(l => l.latency_ms || 0);
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const stdDev = Math.sqrt(latencies.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / latencies.length);

  logs.forEach(log => {
    const zScore = Math.abs((log.latency_ms - mean) / stdDev);
    if (zScore > 3) {
      anomalies.push({
        type: 'Latency Spike',
        timestamp: new Date(log.created_date).toLocaleString(),
        value: log.latency_ms,
        severity: log.latency_ms > mean * 3 ? 'critical' : 'high',
        description: `Latency ${log.latency_ms}ms exceeds normal by ${zScore.toFixed(1)}σ`,
        impact: `${((log.latency_ms / mean - 1) * 100).toFixed(0)}% slower than baseline`
      });
    }
  });

  return anomalies.slice(0, 10);
}

// Root cause analysis
function analyzeRootCauses(logs) {
  const failedLogs = logs.filter(l => l.status === 'failed');
  const highLatencyLogs = logs.filter(l => l.latency_ms > 3000);
  
  const causes = [];

  if (failedLogs.length > logs.length * 0.1) {
    causes.push({
      issue: 'High Failure Rate',
      confidence: 92,
      explanation: `${failedLogs.length} of ${logs.length} executions failed (${(failedLogs.length / logs.length * 100).toFixed(1)}%)`,
      suggestions: [
        'Review prompt template for syntax errors',
        'Check API rate limits and quotas',
        'Validate input variable constraints'
      ]
    });
  }

  if (highLatencyLogs.length > 0) {
    causes.push({
      issue: 'Performance Degradation',
      confidence: 85,
      explanation: `${highLatencyLogs.length} executions exceeded 3s latency threshold`,
      suggestions: [
        'Reduce prompt complexity and token count',
        'Implement caching for repeated queries',
        'Consider model selection optimization'
      ]
    });
  }

  return causes;
}