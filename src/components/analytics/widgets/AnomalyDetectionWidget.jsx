/**
 * Anomaly Detection Widget
 * Real-time detection and alerting for abnormal test metrics
 */
import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function AnomalyDetectionWidget({ config, testMetrics }) {
  // Generate synthetic data with anomalies
  const data = [
    { time: '00:00', value: 42, expected: 42, anomaly: false },
    { time: '04:00', value: 43, expected: 43, anomaly: false },
    { time: '08:00', value: 41, expected: 42, anomaly: false },
    { time: '12:00', value: 28, expected: 43, anomaly: true },
    { time: '16:00', value: 26, expected: 42, anomaly: true },
    { time: '20:00', value: 42, expected: 42, anomaly: false },
    { time: '24:00', value: 44, expected: 43, anomaly: false },
  ];

  const anomalies = data.filter(d => d.anomaly);
  const anomalyScore = Math.round((anomalies.length / data.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Anomaly Detection
        </h3>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${
          anomalyScore > 20 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        }`}>
          {anomalyScore}% anomalies
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis hide domain={[20, 50]} />
          <Tooltip 
            contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
            formatter={(value, name) => {
              if (name === 'expected') return [value, 'Expected'];
              return [value, 'Actual'];
            }}
          />
          <ReferenceLine y={42} stroke="#64748b" strokeDasharray="5" />
          <Line 
            type="monotone" 
            dataKey="expected" 
            stroke="#94a3b8" 
            strokeDasharray="5"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#06b6d4" 
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.anomaly) {
                return (
                  <circle cx={cx} cy={cy} r={4} fill="#ef4444" key={payload.time} />
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {anomalies.length > 0 && (
        <div className="space-y-2">
          {anomalies.map((anom, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="text-white font-semibold">
                  {Math.round((anom.expected - anom.value) / anom.expected * 100)}% drop at {anom.time}
                </p>
                <p className="text-white/60">Value: {anom.value}% vs expected {anom.expected}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}