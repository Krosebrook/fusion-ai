/**
 * Deal Sourcing Step
 * Capture industries, investment size, structures, geography, risk tolerance
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Plus, X } from 'lucide-react';

const INDUSTRIES = [
  'SaaS', 'FinTech', 'HealthTech', 'ClimaTech', 'MarketplacesTech',
  'AI/ML', 'Real Estate', 'Energy', 'Consumer', 'Manufacturing'
];

const DEAL_STRUCTURES = [
  'Equity', 'Convertible Debt', 'SAFE', 'Revenue-Share', 'Structured Debt'
];

const DEAL_STAGES = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Late Stage'
];

const GEOGRAPHIES = [
  'North America', 'Western Europe', 'Eastern Europe', 'APAC', 'MENA', 'LATAM'
];

export function DealSourcingStep({ data = {}, onChange }) {
  const [showHelp, setShowHelp] = useState({});
  
  const handleIndustryToggle = (industry) => {
    const current = data.target_industries || [];
    const updated = current.includes(industry)
      ? current.filter(i => i !== industry)
      : [...current, industry];
    onChange({ target_industries: updated });
  };

  const handleStructureToggle = (structure) => {
    const current = data.preferred_structures || [];
    const updated = current.includes(structure)
      ? current.filter(s => s !== structure)
      : [...current, structure];
    onChange({ preferred_structures: updated });
  };

  const handleGeoToggle = (geo) => {
    const current = data.geography || [];
    const updated = current.includes(geo)
      ? current.filter(g => g !== geo)
      : [...current, geo];
    onChange({ geography: updated });
  };

  return (
    <div className="space-y-8">
      {/* Industries */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Target Industries</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, industries: !p.industries }))}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.industries && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 <strong>Tip:</strong> Select 3-5 industries where you have domain expertise or strong conviction. Our AI will surface deals in these verticals first.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => handleIndustryToggle(ind)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (data.target_industries || []).includes(ind)
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Investment Range */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Investment Size Range</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, range: !p.range }))}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.range && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 <strong>Tip:</strong> Set your typical check size. We'll weight opportunities within this range higher.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Min Investment (USD)</label>
            <Input
              type="number"
              placeholder="e.g., 50000"
              value={data.investment_range?.min_usd || ''}
              onChange={(e) => onChange({
                investment_range: {
                  ...data.investment_range,
                  min_usd: parseInt(e.target.value) || 0
                }
              })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Max Investment (USD)</label>
            <Input
              type="number"
              placeholder="e.g., 500000"
              value={data.investment_range?.max_usd || ''}
              onChange={(e) => onChange({
                investment_range: {
                  ...data.investment_range,
                  max_usd: parseInt(e.target.value) || 0
                }
              })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>
      </motion.div>

      {/* Deal Structures */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-white">Preferred Deal Structures</label>
          <button
            onClick={() => setShowHelp(p => ({ ...p, structures: !p.structures }))}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {showHelp.structures && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4 text-sm text-white/70">
            💡 <strong>Tip:</strong> Mix of equity and debt helps diversify risk. Start with what you understand best.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {DEAL_STRUCTURES.map(struct => (
            <button
              key={struct}
              onClick={() => handleStructureToggle(struct)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (data.preferred_structures || []).includes(struct)
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {struct}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Deal Stages */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Deal Stage Focus</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {DEAL_STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => {
                const current = data.deal_stage_focus || [];
                const updated = current.includes(stage)
                  ? current.filter(s => s !== stage)
                  : [...current, stage];
                onChange({ deal_stage_focus: updated });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (data.deal_stage_focus || []).includes(stage)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Geography */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Geographic Preference</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {GEOGRAPHIES.map(geo => (
            <button
              key={geo}
              onClick={() => handleGeoToggle(geo)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (data.geography || []).includes(geo)
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {geo}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Risk Tolerance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <label className="text-lg font-semibold text-white mb-4 block">Risk Tolerance</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'conservative', label: 'Conservative', desc: 'Proven models, lower risk' },
            { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/reward' },
            { value: 'aggressive', label: 'Aggressive', desc: 'High growth, early stage' }
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onChange({ risk_tolerance: value })}
              className={`p-4 rounded-lg text-center transition-all ${
                data.risk_tolerance === value
                  ? 'bg-red-600/30 border border-red-500 text-white'
                  : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-white/60 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default DealSourcingStep;