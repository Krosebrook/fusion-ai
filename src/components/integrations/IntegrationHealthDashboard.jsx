/**
 * Integration Health Dashboard
 * Visual health score breakdown, rate limits, queue depth, manual triggers
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, AlertTriangle, CheckCircle2, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function IntegrationHealthDashboard() {
  const [healthScores, setHealthScores] = useState(null);
  const [outboxMetrics, setOutboxMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const health = await base44.functions.invoke('calculateIntegrationHealthScore');
        setHealthScores(health);

        // Fetch outbox metrics per integration
        const configs = await base44.entities.IntegrationConfig.filter({ enabled: true });
        const metrics = {};

        for (const config of configs) {
          const items = await base44.entities.IntegrationOutbox.filter({
            integration_id: config.integration_id,
          });

          const queued = items.filter(i => i.status === 'queued').length;
          const sent = items.filter(i => i.status === 'sent').length;
          const failed = items.filter(i => i.status === 'failed').length;
          const deadLetter = items.filter(i => i.status === 'dead_letter').length;
          const throttled = items.filter(i => i.status === 'throttled').length;

          metrics[config.integration_id] = {
            queued,
            sent,
            failed,
            deadLetter,
            throttled,
            total: items.length,
          };
        }

        setOutboxMetrics(metrics);
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleReconcile = async (integrationId) => {
    setReconciling(prev => ({ ...prev, [integrationId]: true }));
    try {
      await base44.functions.invoke('reconcileIntegrations', { integration_id: integrationId });
      // Refresh data
      const health = await base44.functions.invoke('calculateIntegrationHealthScore');
      setHealthScores(health);
    } catch (error) {
      console.error('Reconciliation failed:', error);
    } finally {
      setReconciling(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-white/60">Loading integration health...</div>;

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{healthScores?.overall_health_score || 0}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Overall Health Score</h3>
                <p className="text-white/60 text-sm">Integration ecosystem status</p>
              </div>
            </div>
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-white/60 text-sm">Reconcile Recency</p>
              <p className="text-xl font-bold text-white">30 pts</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Outbox Success</p>
              <p className="text-xl font-bold text-white">40 pts</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Critical Errors</p>
              <p className="text-xl font-bold text-white">20 pts</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">OAuth Status</p>
              <p className="text-xl font-bold text-white">10 pts</p>
            </div>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Per-Integration Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Integration Status</h2>

        {healthScores?.integrations?.map((integration, idx) => (
          <motion.div
            key={integration.integration_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    integration.health_score >= 80 ? 'bg-green-500/20' :
                    integration.health_score >= 60 ? 'bg-yellow-500/20' :
                    'bg-red-500/20'
                  }`}>
                    <span className="text-lg font-bold text-white">{integration.health_score}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{integration.integration_id.replace(/_/g, ' ').toUpperCase()}</h4>
                    <p className="text-white/60 text-sm">Last updated {new Date(integration.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleReconcile(integration.integration_id)}
                  disabled={reconciling[integration.integration_id]}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {reconciling[integration.integration_id] ? (
                    <><Clock className="w-4 h-4 mr-2 animate-spin" />Reconciling...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Run Now</>
                  )}
                </Button>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(integration.breakdown).map(([key, detail]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/70 text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-white font-bold">{detail.value}/{detail.max}</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(detail.value / detail.max) * 100}%` }}
                      />
                    </div>
                    {detail.note && <p className="text-xs text-white/50 mt-2">{detail.note}</p>}
                    {detail.stats && (
                      <p className="text-xs text-white/50 mt-2">
                        ✓ {detail.stats.sent} | ✗ {detail.stats.failed} | ⏸ {detail.stats.throttled}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Outbox Queue Depth */}
              {outboxMetrics[integration.integration_id] && (
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm mb-3">Outbox Queue Depth (24h)</p>
                  <div className="flex gap-2">
                    {['queued', 'sent', 'failed', 'deadLetter', 'throttled'].map((status) => (
                      <div key={status} className="flex-1 text-center">
                        <p className="text-white font-bold text-lg">
                          {outboxMetrics[integration.integration_id][status]}
                        </p>
                        <p className="text-white/50 text-xs capitalize">{status.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default IntegrationHealthDashboard;