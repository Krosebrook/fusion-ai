/**
 * Conversion Funnel Widget
 */
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FunnelChart, Funnel, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function ConversionFunnelWidget({ config }) {
  const { data: tests = [] } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.ABTestConfig.list('-created_date', 5),
  });

  const funnelData = [
    { name: 'Visitors', value: 10000 },
    { name: 'Clicked CTA', value: 7500 },
    { name: 'Form Started', value: 5200 },
    { name: 'Form Completed', value: 3100 },
    { name: 'Converted', value: 1240 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-white">Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={200}>
        <FunnelChart data={funnelData}>
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
          <Funnel
            dataKey="value"
            data={funnelData}
            fill="#06b6d4"
            shape="linear"
          />
        </FunnelChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-white/60">Conversion Rate</p>
          <p className="text-cyan-400 font-semibold">12.4%</p>
        </div>
        <div>
          <p className="text-white/60">Drop-off Rate</p>
          <p className="text-red-400 font-semibold">87.6%</p>
        </div>
      </div>
    </motion.div>
  );
}