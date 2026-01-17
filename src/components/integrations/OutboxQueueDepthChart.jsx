/**
 * Outbox Queue Depth Chart
 * Timeline visualization of queue depth per integration
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { motion } from 'framer-motion';

export function OutboxQueueDepthChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueMetrics = async () => {
      try {
        const configs = await base44.entities.IntegrationConfig.filter({ enabled: true });
        const metrics = {};

        // Aggregate metrics by hour for last 24h
        const now = Date.now();
        const hours = [];
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now - i * 60 * 60 * 1000);
          const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours()).toISOString();
          const hourEnd = new Date(new Date(hourStart).getTime() + 60 * 60 * 1000).toISOString();

          const data = { timestamp: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };

          for (const config of configs) {
            const items = await base44.entities.IntegrationOutbox.filter({
              integration_id: config.integration_id,
              created_date: { $gte: hourStart, $lt: hourEnd },
            });

            const queued = items.filter(i => i.status === 'queued').length;
            const sent = items.filter(i => i.status === 'sent').length;
            const failed = items.filter(i => i.status === 'failed' || i.status === 'dead_letter').length;

            data[`${config.integration_id}_queued`] = queued;
            data[`${config.integration_id}_sent`] = sent;
            data[`${config.integration_id}_failed`] = failed;
          }

          hours.push(data);
        }

        setChartData(hours);
      } catch (error) {
        console.error('Failed to fetch queue metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueMetrics();
  }, []);

  if (loading) return <div className="p-8 text-white/60">Loading queue metrics...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <CinematicCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Outbox Queue Depth (24h)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorQueued" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area type="monotone" dataKey="google_sheets_queued" stackId="1" stroke="none" fill="url(#colorQueued)" name="Google Sheets (Queued)" />
            <Area type="monotone" dataKey="slack_queued" stackId="1" stroke="none" fill="url(#colorQueued)" name="Slack (Queued)" />
            <Area type="monotone" dataKey="resend_sent" stackId="2" stroke="none" fill="url(#colorSent)" name="Resend (Sent)" />
            <Area type="monotone" dataKey="twilio_failed" stackId="3" stroke="none" fill="url(#colorFailed)" name="Twilio (Failed)" />
          </AreaChart>
        </ResponsiveContainer>
      </CinematicCard>
    </motion.div>
  );
}

export default OutboxQueueDepthChart;