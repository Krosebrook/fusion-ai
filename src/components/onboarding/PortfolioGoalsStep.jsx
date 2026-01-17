/**
 * Portfolio Goals Step
 * Time horizon, return expectations, diversification, sector priorities
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { HelpCircle } from 'lucide-react';

export function PortfolioGoalsStep({ data = {}, onChange }) {
  const [showHelp, setShowHelp] = useState({});

  return (
    <div className="space-y-8">
      {/* Time Horizon */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Investment Time Horizon</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, horizon: !p.horizon }))}
            className="text-white/60 hover:text-white/80"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.horizon && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 Longer horizons allow for higher-risk early-stage plays. Shorter horizons benefit from stable growth.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'short_term', label: 'Short Term', years: '1–3 years' },
            { value: 'medium_term', label: 'Medium Term', years: '3–7 years' },
            { value: 'long_term', label: 'Long Term', years: '7+ years' }
          ].map(({ value, label, years }) => (
            <button
              key={value}
              onClick={() => onChange({ time_horizon: value })}
              className={`p-4 rounded-lg transition-all text-center ${
                data.time_horizon === value
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-white/60 mt-1">{years}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Target Annual Return */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Target Annual Return (%)</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, return: !p.return }))}
            className="text-white/60 hover:text-white/80"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.return && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 Average venture returns: 15–25% IRR. Real estate: 8–12%. Set realistic expectations.
          </div>
        )}

        <div className="flex items-center gap-4">
          <Slider
            value={[data.target_annual_return || 15]}
            onValueChange={(v) => onChange({ target_annual_return: v[0] })}
            min={5}
            max={50}
            step={1}
            className="flex-1"
          />
          <div className="text-2xl font-bold text-cyan-400 w-16 text-right">
            {data.target_annual_return || 15}%
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2">Adjust the slider to your expected IRR target.</p>
      </motion.div>

      {/* Diversification */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Diversification Preference</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'high', label: 'High', desc: '15+ positions, small bets' },
            { value: 'moderate', label: 'Moderate', desc: '5–10 positions' },
            { value: 'focused', label: 'Focused', desc: '1–4 large bets' }
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onChange({ diversification_preference: value })}
              className={`p-4 rounded-lg transition-all text-center ${
                data.diversification_preference === value
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-white/60 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sector Priorities */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Top 3 Sector Priorities (Optional)</label>
        <p className="text-white/60 text-sm mb-4">
          List sectors where you want portfolio concentration. E.g., 40% FinTech, 30% HealthTech, 30% Other.
        </p>
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-white/60 font-semibold w-6">{i + 1}.</span>
              <Input
                placeholder={`Sector ${i + 1} (optional)`}
                value={data.sector_priorities?.[i]?.sector_name || ''}
                onChange={(e) => {
                  const updated = [...(data.sector_priorities || [])];
                  updated[i] = { ...updated[i], sector_name: e.target.value };
                  onChange({ sector_priorities: updated });
                }}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Input
                type="number"
                placeholder="%"
                value={data.sector_priorities?.[i]?.allocation_percentage || ''}
                onChange={(e) => {
                  const updated = [...(data.sector_priorities || [])];
                  updated[i] = { ...updated[i], allocation_percentage: parseInt(e.target.value) || 0 };
                  onChange({ sector_priorities: updated });
                }}
                className="w-16 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Asset Classes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Asset Class Focus</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['Venture Capital', 'Private Equity', 'Real Estate', 'Alternative Assets', 'Angel Deals'].map(ac => (
            <button
              key={ac}
              onClick={() => {
                const current = data.asset_class_focus || [];
                const updated = current.includes(ac)
                  ? current.filter(a => a !== ac)
                  : [...current, ac];
                onChange({ asset_class_focus: updated });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (data.asset_class_focus || []).includes(ac)
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {ac}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default PortfolioGoalsStep;