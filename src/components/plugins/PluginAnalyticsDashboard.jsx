/**
 * Plugin Analytics Dashboard
 * Real-time analytics visualization from plugin streams
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { pluginAnalyticsService } from '../services/PluginAnalyticsService';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Zap } from 'lucide-react';

export function PluginAnalyticsDashboard({ plugin, config }) {
  const [streamData, setStreamData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!config?.enabled || !config?.realtime_streaming) return;

    const handleData = (data) => {
      setStreamData((prev) => {
        const updated = { ...prev };
        
        // Update metrics
        if (data.metrics) {
          for (const metric of data.metrics) {
            if (!updated[metric.id]) {
              updated[metric.id] = [];
            }
            updated[metric.id].push({
              timestamp: Date.now(),
              value: metric.value,
            });

            // Keep last 50 data points
            if (updated[metric.id].length > 50) {
              updated[metric.id].shift();
            }
          }
        }

        return updated;
      });
    };

    const handleError = (err) => {
      setError(err.message);
      setIsConnected(false);
    };

    pluginAnalyticsService.connectStream(
      plugin.id,
      config.streaming_endpoint,
      handleData,
      handleError
    );

    setIsConnected(true);

    return () => {
      pluginAnalyticsService.disconnectStream(plugin.id);
    };
  }, [plugin.id, config]);

  const renderVisualization = (viz) => {
    const metricData = viz.metric_ids.flatMap((metricId) => {
      return (streamData[metricId] || []).map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        [metricId]: point.value,
      }));
    });

    const colors = ['#8a5cff', '#ff3b9d', '#00b4d8', '#ff7b00', '#4ade80'];

    const commonProps = {
      width: viz.layout?.width || 500,
      height: viz.layout?.height || 300,
      data: metricData,
    };

    switch (viz.chart_type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {viz.metric_ids.map((metricId, idx) => (
                <Line
                  key={metricId}
                  type="monotone"
                  dataKey={metricId}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metricData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              {viz.metric_ids.map((metricId, idx) => (
                <Area
                  key={metricId}
                  type="monotone"
                  dataKey={metricId}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricData.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              {viz.metric_ids.map((metricId, idx) => (
                <Bar
                  key={metricId}
                  dataKey={metricId}
                  fill={colors[idx % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-white/60">Unsupported chart type: {viz.chart_type}</div>;
    }
  };

  if (error) {
    return (
      <CinematicCard className="p-6">
        <div className="text-center">
          <div className="text-red-400 font-semibold mb-2">Analytics Stream Error</div>
          <div className="text-white/60 text-sm">{error}</div>
        </div>
      </CinematicCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-white">{plugin.name} Analytics</h3>
            <p className="text-white/60 text-sm">Real-time streaming dashboard</p>
          </div>
        </div>
        <Badge className={isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
          <Zap className="w-3 h-3 mr-1" />
          {isConnected ? 'Live' : 'Disconnected'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config?.visualizations?.map((viz, index) => (
          <motion.div
            key={viz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CinematicCard className="p-6">
              <h4 className="text-white font-semibold mb-4">{viz.name}</h4>
              {renderVisualization(viz)}
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {(!config?.visualizations || config.visualizations.length === 0) && (
        <CinematicCard className="p-6">
          <div className="text-center text-white/60">
            No visualizations configured for this plugin
          </div>
        </CinematicCard>
      )}
    </div>
  );
}

export default PluginAnalyticsDashboard;