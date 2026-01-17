/**
 * Predictive ROI Forecasting Widget
 * AI-powered ROI predictions for A/B tests
 */
import { motion } from 'framer-motion';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

export function PredictiveROIWidget({ config }) {
  const forecastData = [
    { day: 'Day 1', actual: 120, predicted: 120, confidence: 0.95 },
    { day: 'Day 2', actual: 285, predicted: 285, confidence: 0.93 },
    { day: 'Day 3', actual: 420, predicted: 420, confidence: 0.91 },
    { day: 'Day 4', actual: 580, predicted: 590, confidence: 0.88 },
    { day: 'Day 5', actual: 650, predicted: 720, confidence: 0.85 },
    { day: 'Day 6', actual: null, predicted: 850, confidence: 0.80 },
    { day: 'Day 7', actual: null, predicted: 950, confidence: 0.75 },
    { day: 'Day 8', actual: null, predicted: 1020, confidence: 0.70 },
  ];

  const latestPrediction = forecastData[forecastData.length - 1];
  const expectedROI = ((1020 - 280) / 280 * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          Predictive ROI Forecast
        </h3>
        <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">
          +{expectedROI}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={forecastData}>
          <defs>
            <linearGradient id="roi-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip 
            contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
            formatter={(value) => value ? `$${value}` : '-'}
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#10b981" 
            fill="url(#roi-gradient)"
            isAnimationActive
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#06b6d4" 
            strokeDasharray="5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-white/60">Current ROI</p>
          <p className="text-green-400 font-bold">$650</p>
        </div>
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <p className="text-white/60">Predicted Day 8</p>
          <p className="text-cyan-400 font-bold">$1,020</p>
        </div>
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <p className="text-white/60">Confidence</p>
          <p className="text-purple-400 font-bold">70%</p>
        </div>
      </div>
    </motion.div>
  );
}