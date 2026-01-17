/**
 * User Segmentation Widget
 */
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function UserSegmentationWidget({ config }) {
  const segmentData = [
    { name: 'New Users', value: 3200, fill: '#06b6d4' },
    { name: 'Returning', value: 4100, fill: '#0ea5e9' },
    { name: 'Premium', value: 2400, fill: '#3b82f6' },
    { name: 'VIP', value: 1200, fill: '#6366f1' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-white">User Segments</h3>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={segmentData}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
          <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {segmentData.map(seg => (
          <div key={seg.name}>
            <p className="text-white/60">{seg.name}</p>
            <p className="text-white font-semibold">{seg.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}