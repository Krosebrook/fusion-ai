/**
 * Integration Rate Limit Viewer
 * Show current rate limits, next available slot, throttled items
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { motion } from 'framer-motion';
import { Clock, Zap, AlertCircle } from 'lucide-react';

const RATE_LIMIT_CONFIG = {
  google_sheets: { rps: 100, concurrent: 10 },
  google_drive: { rps: 100, concurrent: 10 },
  slack: { rps: 1, concurrent: 1 },
  resend: { rps: 2, concurrent: 5 },
  twilio: { rps: 1, concurrent: 5 },
  default: { rps: 1, concurrent: 4 },
};

export function IntegrationRateLimitViewer() {
  const [rateLimitData, setRateLimitData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRateLimitData = async () => {
      try {
        const configs = await base44.entities.IntegrationConfig.filter({ enabled: true });
        const data = {};

        for (const config of configs) {
          const limits = RATE_LIMIT_CONFIG[config.integration_id] || RATE_LIMIT_CONFIG.default;

          // Get throttled items for this integration
          const throttled = await base44.entities.IntegrationOutbox.filter({
            integration_id: config.integration_id,
            status: 'throttled',
          });

          const nextAvailableSlot = throttled.length > 0
            ? new Date(Math.min(...throttled.map(t => new Date(t.retry_after_until).getTime())))
            : new Date();

          const timeTillAvailable = Math.max(0, nextAvailableSlot.getTime() - Date.now());

          data[config.integration_id] = {
            limits,
            throttled_count: throttled.length,
            next_available_at: nextAvailableSlot,
            time_till_available_ms: timeTillAvailable,
            time_till_available_readable: formatTimeDelta(timeTillAvailable),
            oldest_throttled: throttled.length > 0 ? throttled[0].retry_after_seconds : null,
          };
        }

        setRateLimitData(data);
      } catch (error) {
        console.error('Failed to fetch rate limit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRateLimitData();
    const interval = setInterval(fetchRateLimitData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-white/60">Loading rate limit data...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Rate Limits & Queue Status</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(rateLimitData).map(([integrationId, data], idx) => (
          <motion.div
            key={integrationId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{integrationId.toUpperCase()}</h4>
                  <p className="text-white/60 text-sm">Rate: {data.limits.rps} req/s | Concurrency: {data.limits.concurrent}</p>
                </div>
                {data.throttled_count > 0 && (
                  <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {data.throttled_count} throttled
                  </div>
                )}
              </div>

              {/* Throttle Status */}
              {data.throttled_count > 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-red-400" />
                    <p className="text-white font-semibold">Queue Throttled</p>
                  </div>
                  <p className="text-white/70 text-sm">Next available: <span className="font-mono font-bold">{data.time_till_available_readable}</span></p>
                  {data.oldest_throttled && (
                    <p className="text-white/50 text-xs mt-2">Original Retry-After: {data.oldest_throttled}s</p>
                  )}
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-green-300 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Queue available now
                  </p>
                </div>
              )}

              {/* Visual Capacity Meter */}
              <div className="space-y-2">
                <p className="text-white/60 text-xs">Estimated Capacity</p>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (data.throttled_count / data.limits.concurrent) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-white/50 text-xs text-right">
                  {data.throttled_count} / {data.limits.concurrent} slots used
                </p>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function formatTimeDelta(ms) {
  if (ms <= 0) return 'Now';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default IntegrationRateLimitViewer;